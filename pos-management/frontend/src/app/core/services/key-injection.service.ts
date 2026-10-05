import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { KeyInjectionOrder, CreateKeyInjectionOrderRequest } from '../models/key-injection.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KeyInjectionService {
  private api = inject(BaseApiService);

  loading = signal<boolean>(false);
  orders = signal<KeyInjectionOrder[]>([]);
  totalOrders = signal<number>(0);

  getOrders(page = 0, size = 10, status = ''): Observable<ApiResponse<PageResponse<KeyInjectionOrder>>> {
    this.loading.set(true);
    return this.api.get<PageResponse<KeyInjectionOrder>>('/security/key-injections', { page, size, status }).pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.orders.set(res.data.content);
            this.totalOrders.set(res.data.totalElements);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  createOrder(req: CreateKeyInjectionOrderRequest): Observable<ApiResponse<KeyInjectionOrder>> {
    return this.api.post<KeyInjectionOrder>('/security/key-injections', req);
  }

  executeInjection(id: string): Observable<ApiResponse<KeyInjectionOrder>> {
    return this.api.post<KeyInjectionOrder>(`/security/key-injections/${id}/execute`, {});
  }
}
