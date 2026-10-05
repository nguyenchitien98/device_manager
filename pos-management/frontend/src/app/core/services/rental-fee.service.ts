import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { RentalFeePolicy, MonthlyFeeCharge } from '../models/rental-fee.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RentalFeeService {
  private api = inject(BaseApiService);

  loading = signal<boolean>(false);
  policies = signal<RentalFeePolicy[]>([]);
  charges = signal<MonthlyFeeCharge[]>([]);
  totalCharges = signal<number>(0);

  getPolicies(): Observable<ApiResponse<RentalFeePolicy[]>> {
    return this.api.get<RentalFeePolicy[]>('/finance/rental-fees/policies').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.policies.set(res.data);
        }
      })
    );
  }

  createPolicy(policy: Partial<RentalFeePolicy>): Observable<ApiResponse<RentalFeePolicy>> {
    return this.api.post<RentalFeePolicy>('/finance/rental-fees/policies', policy);
  }

  getCharges(period = '', page = 0, size = 10): Observable<ApiResponse<PageResponse<MonthlyFeeCharge>>> {
    this.loading.set(true);
    return this.api.get<PageResponse<MonthlyFeeCharge>>('/finance/rental-fees/charges', { period, page, size }).pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.charges.set(res.data.content);
            this.totalCharges.set(res.data.totalElements);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  calculatePeriod(period: string): Observable<ApiResponse<MonthlyFeeCharge[]>> {
    return this.api.post<MonthlyFeeCharge[]>('/finance/rental-fees/calculate-period', null, { params: { period } });
  }

  chargeFee(id: number): Observable<ApiResponse<MonthlyFeeCharge>> {
    return this.api.post<MonthlyFeeCharge>(`/finance/rental-fees/charges/${id}/charge`, null);
  }

  waiveFee(id: number): Observable<ApiResponse<MonthlyFeeCharge>> {
    return this.api.post<MonthlyFeeCharge>(`/finance/rental-fees/charges/${id}/waive`, null);
  }
}
