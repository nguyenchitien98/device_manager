import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApprovalApiService extends BaseApiService {

  getInbox(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/approvals/inbox', params);
  }

  getMyRequests(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/approvals/my-requests', params);
  }

  getAllRequests(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/approvals/all', params);
  }

  getApprovalById(id: string | number): Observable<ApiResponse<any>> {
    return this.getById('/approvals', id);
  }

  approve(id: string | number, comment?: string): Observable<ApiResponse<any>> {
    return this.post(`/approvals/${id}/approve`, { comment });
  }

  reject(id: string | number, reason: string): Observable<ApiResponse<any>> {
    return this.post(`/approvals/${id}/reject`, { reason });
  }

  returnForEdit(id: string | number, comment: string): Observable<ApiResponse<any>> {
    return this.post(`/approvals/${id}/return-for-edit`, { comment });
  }

  cancelRequest(id: string | number): Observable<ApiResponse<any>> {
    return this.post(`/approvals/${id}/cancel`, {});
  }
}
