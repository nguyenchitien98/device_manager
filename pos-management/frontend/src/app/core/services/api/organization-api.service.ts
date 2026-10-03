import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationApiService extends BaseApiService {

  // Business Units
  getBusinessUnits(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/organization/business-units', params);
  }

  createBusinessUnit(dto: any): Observable<ApiResponse<any>> {
    return this.post('/organization/business-units', dto);
  }

  updateBusinessUnit(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/organization/business-units', id, dto);
  }

  deleteBusinessUnit(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/organization/business-units', id);
  }

  // Warehouses
  getWarehouses(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/organization/warehouses', params);
  }

  createWarehouse(dto: any): Observable<ApiResponse<any>> {
    return this.post('/organization/warehouses', dto);
  }

  updateWarehouse(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/organization/warehouses', id, dto);
  }

  deleteWarehouse(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/organization/warehouses', id);
  }
}
