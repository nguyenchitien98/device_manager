import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryApiService extends BaseApiService {

  // Purchase Orders
  getPurchaseOrders(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/purchase-orders', params);
  }

  getPurchaseOrderById(id: string | number): Observable<ApiResponse<any>> {
    return this.getById('/inventory/purchase-orders', id);
  }

  createPurchaseOrder(dto: any): Observable<ApiResponse<any>> {
    return this.post('/inventory/purchase-orders', dto);
  }

  approvePurchaseOrder(id: string | number): Observable<ApiResponse<any>> {
    return this.post(`/inventory/purchase-orders/${id}/approve`, {});
  }

  // Import Stock
  getImports(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/imports', params);
  }

  createImport(dto: any): Observable<ApiResponse<any>> {
    return this.post('/inventory/imports', dto);
  }

  // Export Stock
  getExports(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/exports', params);
  }

  createExport(dto: any): Observable<ApiResponse<any>> {
    return this.post('/inventory/exports', dto);
  }

  // Transfer Stock
  getTransfers(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/transfers', params);
  }

  createTransfer(dto: any): Observable<ApiResponse<any>> {
    return this.post('/inventory/transfers', dto);
  }

  // Stock Summary & Ledger
  getInventoryStock(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/stock', params);
  }

  getStockSummary(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/stock', params);
  }

  getStockTransactions(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/inventory/transactions', params);
  }

  // Logistics
  getLogisticsList(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/logistics/shipments', params);
  }
}
