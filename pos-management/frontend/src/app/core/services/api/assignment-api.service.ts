import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentApiService extends BaseApiService {

  getAssignments(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/assignments', params);
  }

  getAssignmentById(id: string | number): Observable<ApiResponse<any>> {
    return this.getById('/assignments', id);
  }

  createAssignment(dto: any, idempotencyKey?: string): Observable<ApiResponse<any>> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    return this.post('/assignments', dto, { headers });
  }

  returnAssignment(id: string | number, reason: string): Observable<ApiResponse<any>> {
    return this.post(`/assignments/${id}/return`, { reason });
  }

  transferAssignment(id: string | number, newMerchantId: string | number, newTerminalId?: string | number): Observable<ApiResponse<any>> {
    return this.post(`/assignments/${id}/transfer`, { newMerchantId, newTerminalId });
  }

  getAssignmentHistory(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/assignments/history', params);
  }

  exportAssignments(params?: QueryParams): Observable<Blob> {
    return this.exportFile('/assignments/export', params);
  }

  exportAssignmentHistory(params?: QueryParams): Observable<Blob> {
    return this.exportFile('/assignments/history/export', params);
  }
}
