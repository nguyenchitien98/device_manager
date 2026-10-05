import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { SimCard, CreateSimCardRequest, SamCard, CreateSamCardRequest } from '../models/telecom.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TelecomService {
  private api = inject(BaseApiService);

  loading = signal<boolean>(false);
  simCards = signal<SimCard[]>([]);
  samCards = signal<SamCard[]>([]);
  totalSims = signal<number>(0);
  totalSams = signal<number>(0);

  getSimCards(page = 0, size = 10, query = '', telco = '', status = ''): Observable<ApiResponse<PageResponse<SimCard>>> {
    this.loading.set(true);
    return this.api.get<PageResponse<SimCard>>('/telecom/sims', { page, size, query, telco, status }).pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.simCards.set(res.data.content);
            this.totalSims.set(res.data.totalElements);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  createSimCard(req: CreateSimCardRequest): Observable<ApiResponse<SimCard>> {
    return this.api.post<SimCard>('/telecom/sims', req);
  }

  getSamCards(page = 0, size = 10, query = '', status = ''): Observable<ApiResponse<PageResponse<SamCard>>> {
    this.loading.set(true);
    return this.api.get<PageResponse<SamCard>>('/telecom/sams', { page, size, query, status }).pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.samCards.set(res.data.content);
            this.totalSams.set(res.data.totalElements);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  createSamCard(req: CreateSamCardRequest): Observable<ApiResponse<SamCard>> {
    return this.api.post<SamCard>('/telecom/sams', req);
  }
}
