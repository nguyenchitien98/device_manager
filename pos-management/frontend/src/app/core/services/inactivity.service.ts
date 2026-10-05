import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { InactivityAlert } from '../models/inactivity.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InactivityService {
  private api = inject(BaseApiService);

  loading = signal<boolean>(false);
  alerts = signal<InactivityAlert[]>([]);
  totalAlerts = signal<number>(0);

  getAlerts(page = 0, size = 10, status = ''): Observable<ApiResponse<PageResponse<InactivityAlert>>> {
    this.loading.set(true);
    return this.api.get<PageResponse<InactivityAlert>>('/monitoring/inactivity/alerts', { page, size, status }).pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.alerts.set(res.data.content);
            this.totalAlerts.set(res.data.totalElements);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  triggerRecall(id: string): Observable<ApiResponse<InactivityAlert>> {
    return this.api.post<InactivityAlert>(`/monitoring/inactivity/alerts/${id}/trigger-recall`, {});
  }
}
