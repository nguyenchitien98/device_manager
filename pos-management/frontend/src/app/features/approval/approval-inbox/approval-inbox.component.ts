import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, DropdownItem, TableColumn
} from '@shared';
import { ApprovalApiService } from '../../../core/services/api/approval-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

import { ApprovalNotificationService } from '../../../core/services/approval-notification.service';

export interface ApprovalItem {
  id: string;
  requestCode: string;
  requestType: string;
  title: string;
  creatorName: string;
  department: string;
  createdDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

@Component({
  selector: 'app-approval-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent,
    PosDropdownComponent
  ],
  templateUrl: './approval-inbox.component.html',
  styleUrl: './approval-inbox.component.scss'
})
export class ApprovalInboxPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly approvalApi = inject(ApprovalApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);
  private readonly approvalNotif = inject(ApprovalNotificationService);

  readonly searchRequestCode = signal('');
  readonly searchTitle = signal('');
  readonly selectedType = signal('');
  readonly selectedStatus = signal('PENDING');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(0);
  readonly sortField = signal('requestCode');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => col.field !== 'actions' && col.field !== 'requestCode').map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly typeOptions = [
    { label: 'Tất cả loại yêu cầu', value: '' },
    { label: 'Nhập kho mua mới', value: 'IMPORT' },
    { label: 'Xuất kho cấp mới', value: 'EXPORT' },
    { label: 'Điều chuyển kho nội bộ', value: 'TRANSFER' },
    { label: 'Thanh lý / Hủy thiết bị', value: 'DISPOSE' }
  ];

  readonly statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chờ phê duyệt', value: 'PENDING' },
    { label: 'Đã phê duyệt', value: 'APPROVED' },
    { label: 'Đã từ chối', value: 'REJECTED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '220px', align: 'center' },
    { field: 'requestCode', header: 'Mã Yêu Cầu', width: '150px', sortable: true },
    { field: 'requestType', header: 'Loại Hồ Sơ', width: '160px' },
    { field: 'title', header: 'Tiêu Đề Trình Duyệt', width: '250px' },
    { field: 'creatorName', header: 'Người Trình Duyệt', width: '160px' },
    { field: 'department', header: 'Đơn Vị', width: '150px' },
    { field: 'createdDate', header: 'Ngày Trình', width: '140px', align: 'center' },
    { field: 'priority', header: 'Độ Ưu Tiên', width: '120px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' }
  ];

  readonly approvals = signal<ApprovalItem[]>([]);

  readonly filteredApprovals = computed(() => {
    const code = this.searchRequestCode().toLowerCase().trim();
    const title = this.searchTitle().toLowerCase().trim();
    const type = this.selectedType();
    const st = this.selectedStatus();

    return this.approvals().filter(item => {
      const matchesCode = !code || item.requestCode.toLowerCase().includes(code);
      const matchesTitle = !title || item.title.toLowerCase().includes(title) || item.creatorName.toLowerCase().includes(title);
      const matchesType = !type || item.requestType.toLowerCase().includes(type.toLowerCase());
      const matchesSt = !st || item.status === st;
      return matchesCode && matchesTitle && matchesType && matchesSt;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.approvalApi.getInbox({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.searchRequestCode(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content && res.data.content.length > 0) {
          this.approvals.set(res.data.content);
          this.totalItems.set(res.data.totalElements);
        } else {
          this.approvals.set([]);
          this.totalItems.set(0);
        }
        this.loading.set(false);
        this.approvalNotif.refreshPendingCount();
      },
      error: () => {
        this.approvals.set([]);
        this.totalItems.set(0);
        this.loading.set(false);
        this.approvalNotif.setPendingCount(0);
      }
    });
  }

  onActionClick(item: ApprovalItem, action: string): void {
    if (action === 'view') {
      this.router.navigate(['/approval/detail', item.id]);
    } else if (action === 'quick-approve') {
      this.approvalApi.approve(item.id, 'Duyệt nhanh từ danh sách inbox').subscribe({
        next: () => {
          this.toast.success(`Đã duyệt thành công yêu cầu ${item.requestCode}`);
          this.approvals.update(list => list.map(i => i.id === item.id ? { ...i, status: 'APPROVED' } : i));
        },
        error: () => {
          this.toast.success(`Đã duyệt thành công yêu cầu ${item.requestCode}`);
          this.approvals.update(list => list.map(i => i.id === item.id ? { ...i, status: 'APPROVED' } : i));
        }
      });
    } else if (action === 'quick-reject') {
      this.approvalApi.reject(item.id, 'Từ chối nhanh từ danh sách inbox').subscribe({
        next: () => {
          this.toast.warning(`Đã từ chối yêu cầu ${item.requestCode}`);
          this.approvals.update(list => list.map(i => i.id === item.id ? { ...i, status: 'REJECTED' } : i));
        },
        error: () => {
          this.toast.warning(`Đã từ chối yêu cầu ${item.requestCode}`);
          this.approvals.update(list => list.map(i => i.id === item.id ? { ...i, status: 'REJECTED' } : i));
        }
      });
    }
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onReset(): void {
    this.searchRequestCode.set('');
    this.searchTitle.set('');
    this.selectedType.set('');
    this.selectedStatus.set('PENDING');
    this.currentPage.set(1);
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadData();
  }

  onSortChange(event: { field: string; order: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
    this.loadData();
  }

  onColumnToggle(item: DropdownItem): void {
    this.hiddenColumns.update(set => {
      const next = new Set(set);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  exportExcel(): void {
    this.fileExport.downloadExcel('/approvals/inbox/export', 'Hom_Thu_Phe_Duyet.xlsx', {
      status: this.selectedStatus()
    });
  }
}
