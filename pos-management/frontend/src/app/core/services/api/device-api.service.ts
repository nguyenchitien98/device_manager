import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceApiService extends BaseApiService {

  searchDevices(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/devices', params);
  }

  getDeviceBySerial(serial: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/devices/${serial}`);
  }

  getDeviceLifecycle(serial: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/devices/${serial}/lifecycle`);
  }

  getDeviceAssignments(serial: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/devices/${serial}/assignments`);
  }

  getDeviceRepairs(serial: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/devices/${serial}/repairs`);
  }

  getDeviceStockHistory(serial: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/devices/${serial}/stock-history`);
  }

  getDeviceAuditLogs(serial: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/devices/${serial}/audit-logs`);
  }

  updateDeviceStatus(serial: string, status: string, reason?: string): Observable<ApiResponse<any>> {
    return this.patch(`/devices/${serial}/status`, '', { status, reason });
  }

  createRepairOrder(serial: string, dto: any): Observable<ApiResponse<any>> {
    return this.post(`/devices/${serial}/repairs`, dto);
  }

  disposeDevice(serial: string, reason: string): Observable<ApiResponse<any>> {
    return this.post(`/devices/${serial}/dispose`, { reason });
  }

  exportDevices(params?: QueryParams): Observable<Blob> {
    return this.exportFile('/devices/export', params);
  }

  getRepairs(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/repairs', params);
  }

  completeRepair(id: string, dto?: any): Observable<ApiResponse<any>> {
    return this.patch(`/repairs/${id}/complete`, '', dto || {});
  }

  failRepair(id: string, dto?: any): Observable<ApiResponse<any>> {
    return this.patch(`/repairs/${id}/fail`, '', dto || {});
  }

  exportRepairs(params?: QueryParams): Observable<Blob> {
    return this.exportFile('/repairs/export', params);
  }
}
