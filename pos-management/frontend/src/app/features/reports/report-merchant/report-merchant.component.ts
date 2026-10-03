import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, TableColumn
} from '@shared';
import { MerchantApiService } from '../../../core/services/api/merchant-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface MerchantReportRow {
  merchantName: string;
  mccCode: string;
  city: string;
  totalTerminals: number;
  activeTerminals: number;
  inactiveTerminals: number;
  monthlyTxnVolume: number;
  monthlyRevenue: number;
  efficiencyRating: 'EXCELLENT' | 'GOOD' | 'POOR';
}

@Component({
  selector: 'app-report-merchant',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent
  ],
  templateUrl: './report-merchant.component.html',
  styleUrl: './report-merchant.component.scss'
})
export class ReportMerchantPageComponent implements OnInit {
  private readonly merchantApi = inject(MerchantApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly keyword = signal('');
  readonly selectedCity = signal('');
  readonly selectedRating = signal('');
  readonly loading = signal(false);

  readonly cityOptions = [
    { label: 'Tất cả tỉnh thành', value: '' },
    { label: 'Hà Nội', value: 'Hà Nội' },
    { label: 'TP. Hồ Chí Minh', value: 'TP. Hồ Chí Minh' },
    { label: 'Đà Nẵng', value: 'Đà Nẵng' }
  ];

  readonly ratingOptions = [
    { label: 'Tất cả mức hiệu quả', value: '' },
    { label: 'Xuất sắc (>1000 giao dịch/tháng)', value: 'EXCELLENT' },
    { label: 'Đạt chuẩn (>300 giao dịch/tháng)', value: 'GOOD' },
    { label: 'Thấp (<100 giao dịch/tháng)', value: 'POOR' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'merchantName', header: 'Tên Merchant', width: '220px' },
    { field: 'mccCode', header: 'Mã MCC', width: '100px', align: 'center' },
    { field: 'city', header: 'Khu Vực / Tỉnh Thành', width: '150px' },
    { field: 'totalTerminals', header: 'Tổng POS Cấp', width: '120px', align: 'right' },
    { field: 'activeTerminals', header: 'POS Hoạt Động', width: '130px', align: 'right' },
    { field: 'monthlyTxnVolume', header: 'Sản Lượng GD/Tháng', width: '160px', align: 'right' },
    { field: 'monthlyRevenue', header: 'Doanh Số GD (VNĐ)', width: '180px', align: 'right' },
    { field: 'efficiencyRating', header: 'Đánh Giá Hiệu Quả', width: '150px', align: 'center' }
  ];

  readonly reportRows = signal<MerchantReportRow[]>([
    { merchantName: 'Công ty Cổ phần Thương mại WinMart', mccCode: '5411', city: 'Hà Nội', totalTerminals: 45, activeTerminals: 44, inactiveTerminals: 1, monthlyTxnVolume: 25400, monthlyRevenue: 12500000000, efficiencyRating: 'EXCELLENT' },
    { merchantName: 'Chuỗi Cà phê Phúc Long', mccCode: '5812', city: 'TP. Hồ Chí Minh', totalTerminals: 30, activeTerminals: 28, inactiveTerminals: 2, monthlyTxnVolume: 18200, monthlyRevenue: 8900000000, efficiencyRating: 'EXCELLENT' },
    { merchantName: 'Nhà hàng Hải Sản Mỹ Khê', mccCode: '5812', city: 'Đà Nẵng', totalTerminals: 4, activeTerminals: 2, inactiveTerminals: 2, monthlyTxnVolume: 85, monthlyRevenue: 120000000, efficiencyRating: 'POOR' }
  ]);

  readonly filteredReport = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const city = this.selectedCity();
    const rating = this.selectedRating();

    return this.reportRows().filter(item => {
      const matchesKw = !kw || item.merchantName.toLowerCase().includes(kw);
      const matchesCity = !city || item.city === city;
      const matchesRating = !rating || item.efficiencyRating === rating;
      return matchesKw && matchesCity && matchesRating;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.merchantApi.getMerchants({
      name: this.keyword(),
      city: this.selectedCity()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.reportRows.set(res.data.content);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onExportExcel(): void {
    this.fileExport.downloadExcel('/reports/merchants/export', 'Bao_Cao_Hieu_Qua_Merchant.xlsx', {
      name: this.keyword(),
      city: this.selectedCity()
    });
  }

  onExportPdf(): void {
    this.toast.info('Đang xuất báo cáo PDF Merchant...');
    this.fileExport.downloadExcel('/reports/merchants/export-pdf', 'Bao_Cao_Hieu_Qua_Merchant.pdf', {
      name: this.keyword()
    });
  }
}
