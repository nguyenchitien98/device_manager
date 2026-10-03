import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogApiService extends BaseApiService {

  // Device Categories
  getCategories(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/catalog/device-categories', params);
  }

  createCategory(dto: any): Observable<ApiResponse<any>> {
    return this.post('/catalog/device-categories', dto);
  }

  updateCategory(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/catalog/device-categories', id, dto);
  }

  deleteCategory(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/catalog/device-categories', id);
  }

  // Device Types
  getDeviceTypes(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/catalog/device-types', params);
  }

  createDeviceType(dto: any): Observable<ApiResponse<any>> {
    return this.post('/catalog/device-types', dto);
  }

  updateDeviceType(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/catalog/device-types', id, dto);
  }

  deleteDeviceType(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/catalog/device-types', id);
  }

  // Device Models
  getModels(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/catalog/device-models', params);
  }

  createModel(dto: any): Observable<ApiResponse<any>> {
    return this.post('/catalog/device-models', dto);
  }

  updateModel(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/catalog/device-models', id, dto);
  }

  deleteModel(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/catalog/device-models', id);
  }

  // Vendors
  getVendors(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/catalog/vendors', params);
  }

  createVendor(dto: any): Observable<ApiResponse<any>> {
    return this.post('/catalog/vendors', dto);
  }

  updateVendor(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/catalog/vendors', id, dto);
  }

  deleteVendor(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/catalog/vendors', id);
  }

  // MCC
  getMccList(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/catalog/mcc', params);
  }

  createMcc(dto: any): Observable<ApiResponse<any>> {
    return this.post('/catalog/mcc', dto);
  }

  updateMcc(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/catalog/mcc', id, dto);
  }

  deleteMcc(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/catalog/mcc', id);
  }

  // Fee Policies
  getFeePolicies(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/catalog/fee-policies', params);
  }

  createFeePolicy(dto: any): Observable<ApiResponse<any>> {
    return this.post('/catalog/fee-policies', dto);
  }

  updateFeePolicy(id: string | number, dto: any): Observable<ApiResponse<any>> {
    return this.put('/catalog/fee-policies', id, dto);
  }

  deleteFeePolicy(id: string | number): Observable<ApiResponse<void>> {
    return this.delete('/catalog/fee-policies', id);
  }
}
