import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SystemApiService extends BaseApiService {

  // User Management
  getUsers(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/admin/users', params);
  }

  createUser(dto: any): Observable<ApiResponse<any>> {
    return this.post('/admin/users', dto);
  }

  updateUser(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/admin/users', id, dto);
  }

  toggleUserLock(id: string | number, isLocked: boolean): Observable<ApiResponse<any>> {
    return this.patch(`/admin/users/${id}/lock`, '', { isLocked });
  }

  resetPassword(id: string | number): Observable<ApiResponse<any>> {
    return this.post(`/admin/users/${id}/reset-password`, {});
  }

  // Role Management
  getRoles(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/admin/roles', params);
  }

  createRole(dto: any): Observable<ApiResponse<any>> {
    return this.post('/admin/roles', dto);
  }

  updateRolePermissions(roleId: string | number, permissions: string[]): Observable<ApiResponse<any>> {
    return this.put(`/admin/roles/${roleId}/permissions`, '', { permissions });
  }

  // Dashboard & POS Monitoring
  getDashboardSummary(): Observable<ApiResponse<any>> {
    return this.get('/dashboard/summary');
  }

  getPosMonitoringStatus(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/monitoring/pos-status', params);
  }

  getAuditLogs(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/monitoring/audit-logs', params);
  }

  // System Configs
  getSystemConfigs(): Observable<ApiResponse<any>> {
    return this.get('/admin/config');
  }

  updateSystemConfigs(configs: Record<string, any>): Observable<ApiResponse<any>> {
    return this.put('/admin/config', '', configs);
  }
}
