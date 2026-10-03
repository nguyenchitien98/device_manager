import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ToastService } from './toast.service';
import { QueryParams } from '../models/api-response.model';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileExportService {
  private readonly apiService = inject(BaseApiService);
  private readonly toastService = inject(ToastService);

  downloadExcel(endpoint: string, defaultFileName = 'export_data.xlsx', params?: QueryParams): void {
    const toastId = this.toastService.info('Đang chuẩn bị file Excel, vui lòng chờ...', 'Xuất dữ liệu', 0);

    this.apiService.exportFile(endpoint, params).pipe(
      catchError((error) => {
        this.toastService.error('Không thể xuất file. Vui lòng kiểm tra lại điều kiện lọc.', 'Xuất Excel thất bại');
        return throwError(() => error);
      }),
      finalize(() => {
        this.toastService.remove(toastId);
      })
    ).subscribe((blob: Blob) => {
      this.saveBlob(blob, defaultFileName);
      this.toastService.success(`Đã xuất file ${defaultFileName} thành công!`, 'Xuất dữ liệu');
    });
  }

  saveBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
