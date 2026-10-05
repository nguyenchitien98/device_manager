import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { MaintenanceTicket, CreateTicketRequest } from '../models/ticket.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private api = inject(BaseApiService);

  loading = signal<boolean>(false);
  tickets = signal<MaintenanceTicket[]>([]);
  totalTickets = signal<number>(0);

  getTickets(page = 0, size = 10, status = '', priority = ''): Observable<ApiResponse<PageResponse<MaintenanceTicket>>> {
    this.loading.set(true);
    return this.api.get<PageResponse<MaintenanceTicket>>('/tickets', { page, size, status, priority }).pipe(
      tap({
        next: (res) => {
          if (res.success && res.data) {
            this.tickets.set(res.data.content);
            this.totalTickets.set(res.data.totalElements);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  createTicket(req: CreateTicketRequest): Observable<ApiResponse<MaintenanceTicket>> {
    return this.api.post<MaintenanceTicket>('/tickets', req);
  }

  resolveTicket(id: string, notes: string): Observable<ApiResponse<MaintenanceTicket>> {
    return this.api.post<MaintenanceTicket>(`/tickets/${id}/resolve`, null, { params: { resolutionNotes: notes } });
  }
}
