import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../base-api.service';
import { ApiResponse, PageResponse, QueryParams } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService extends BaseApiService {

  getNotifications(params?: QueryParams): Observable<ApiResponse<PageResponse<any>>> {
    return this.getPage('/notifications', params);
  }

  getUnreadCount(): Observable<ApiResponse<{ unreadCount: number }>> {
    return this.get<{ unreadCount: number }>('/notifications/unread-count');
  }

  markAsRead(id: string): Observable<ApiResponse<any>> {
    return this.patch(`/notifications/${id}/read`);
  }

  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.patch('/notifications/read-all');
  }
}
