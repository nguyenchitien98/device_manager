import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MerchantApiService extends BaseApiService {

  // Merchant CRUD
  getMerchants(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/merchants', params);
  }

  getMerchantById(id: string | number): Observable<ApiResponse<any>> {
    return this.getById('/merchants', id);
  }

  createMerchant(dto: any): Observable<ApiResponse<any>> {
    return this.post('/merchants', dto);
  }

  updateMerchant(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/merchants', id, dto);
  }

  updateMerchantStatus(id: string | number, status: string, reason?: string): Observable<ApiResponse<any>> {
    return this.patch(`/merchants/${id}/status`, '', { status, reason });
  }

  assignFeePolicy(merchantId: string | number, feePolicyId: string | number): Observable<ApiResponse<any>> {
    return this.post(`/merchants/${merchantId}/fee-policy`, { feePolicyId });
  }

  // Terminals / TIDs
  getTerminals(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/terminals', params);
  }

  getTerminalById(id: string | number): Observable<ApiResponse<any>> {
    return this.getById('/terminals', id);
  }

  createTerminal(dto: any): Observable<ApiResponse<any>> {
    return this.post('/terminals', dto);
  }

  updateTerminalStatus(id: string | number, status: string): Observable<ApiResponse<any>> {
    return this.patch(`/terminals/${id}/status`, '', { status });
  }
}
