import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent,
  PosSelectComponent,
  PosBadgeComponent,
  PosTableComponent,
  PosPaginationComponent,
  TableColumn
} from '../../../shared';
import { InactivityService } from '../../../core/services/inactivity.service';
import { InactivityAlert } from '../../../core/models/inactivity.model';

@Component({
  selector: 'app-inactivity-alert-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PosButtonComponent,
    PosSelectComponent,
    PosBadgeComponent,
    PosTableComponent,
    PosPaginationComponent
  ],
  templateUrl: './inactivity-alert-list.component.html',
  styleUrls: ['./inactivity-alert-list.component.scss']
})
export class InactivityAlertListComponent implements OnInit {
  protected inactivityService = inject(InactivityService);

  selectedStatus = signal('');
  currentPage = signal(0);
  pageSize = signal(10);

  statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Mới phát hiện (NEW)', value: 'NEW' },
    { label: 'Đã gửi thông báo (NOTIFIED)', value: 'NOTIFIED' },
    { label: 'Đã tạo thu hồi (RECALLED)', value: 'RECALLED' },
    { label: 'Bỏ qua (DISMISSED)', value: 'DISMISSED' }
  ];

  columns: TableColumn[] = [
    { field: 'terminalId', header: 'Mã Terminal ID', width: '200px' },
    { field: 'daysInactive', header: 'Số Ngày Không Quẹt', width: '160px' },
    { field: 'lastTxAt', header: 'Giao Dịch Cuối', width: '180px' },
    { field: 'status', header: 'Trạng Thái', width: '150px' },
    { field: 'notes', header: 'Ghi Chú Xử Lý' },
    { field: 'createdAt', header: 'Thời Gian Phát Hiện', width: '180px' },
    { field: 'actions', header: 'Thao Tác', width: '160px', align: 'center' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.inactivityService.getAlerts(
      this.currentPage(),
      this.pageSize(),
      this.selectedStatus()
    ).subscribe();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  triggerRecall(alertId: string) {
    this.inactivityService.triggerRecall(alertId).subscribe({
      next: () => this.loadData()
    });
  }
}
