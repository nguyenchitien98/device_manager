import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PageResponse, QueryParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = '/api/v1';

  protected buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  get<T>(endpoint: string, params?: QueryParams): Observable<ApiResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  getPage<T>(endpoint: string, params?: QueryParams): Observable<ApiResponse<PageResponse<T>>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<PageResponse<T>>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: string | number): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}/${id}`);
  }

  post<T, D = any>(endpoint: string, body: D): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  put<T, D = any>(endpoint: string, id?: string | number, body?: D): Observable<ApiResponse<T>> {
    const url = (id !== undefined && id !== null && id !== '') ? `${this.baseUrl}${endpoint}/${id}` : `${this.baseUrl}${endpoint}`;
    return this.http.put<ApiResponse<T>>(url, body);
  }

  patch<T, D = any>(endpoint: string, id?: string | number, body?: D): Observable<ApiResponse<T>> {
    const url = (id !== undefined && id !== null && id !== '') ? `${this.baseUrl}${endpoint}/${id}` : `${this.baseUrl}${endpoint}`;
    return this.http.patch<ApiResponse<T>>(url, body || {});
  }

  delete<T = void>(endpoint: string, id?: string | number): Observable<ApiResponse<T>> {
    const url = (id !== undefined && id !== null && id !== '') ? `${this.baseUrl}${endpoint}/${id}` : `${this.baseUrl}${endpoint}`;
    return this.http.delete<ApiResponse<T>>(url);
  }

  exportFile(endpoint: string, params?: QueryParams): Observable<Blob> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
