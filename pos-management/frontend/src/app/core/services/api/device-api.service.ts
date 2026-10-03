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

  updateDeviceStatus(serial: string, status: string, reason?: string): Observable<ApiResponse<any>> {
    return this.patch(`/devices/${serial}/status`, '', { status, reason });
  }

  createRepairOrder(serial: string, dto: any): Observable<ApiResponse<any>> {
    return this.post(`/devices/${serial}/repairs`, dto);
  }

  disposeDevice(serial: string, reason: string): Observable<ApiResponse<any>> {
    return this.post(`/devices/${serial}/dispose`, { reason });
  }
}
