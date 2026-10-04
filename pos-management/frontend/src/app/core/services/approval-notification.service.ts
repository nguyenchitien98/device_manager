import { Injectable, signal, inject } from '@angular/core';
import { ApprovalApiService } from './api/approval-api.service';

@Injectable({
  providedIn: 'root'
})
export class ApprovalNotificationService {
  private readonly approvalApi = inject(ApprovalApiService);

  /** Signal tracking total pending approval items for badges */
  readonly pendingCount = signal<number>(0);

  constructor() {
    this.refreshPendingCount();
  }

  refreshPendingCount(): void {
    this.approvalApi.getInbox({ page: 0, size: 100, status: 'PENDING' }).subscribe({
      next: (res) => {
        const total = res?.data?.totalElements ?? (res?.data?.content ? res.data.content.length : 0);
        this.pendingCount.set(total);
      },
      error: () => {
        this.pendingCount.set(0);
      }
    });
  }

  setPendingCount(count: number): void {
    this.pendingCount.set(count);
  }
}
