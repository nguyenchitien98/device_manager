import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, DropdownItem
} from '@shared';
import { SystemApiService } from '../../../core/services/api/system-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  userRole: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  detail: string;
}

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss'
})
export class AuditLogListPageComponent implements OnInit {
  private readonly systemApi = inject(SystemApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchUsername = signal('');
  readonly searchAction = signal('');
  readonly selectedModule = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(3);
  readonly sortField = signal('timestamp');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => col.field !== 'timestamp' && col.field !== 'username').map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly moduleOptions = [
    { label: 'Tất cả module', value: '' },
    { label: 'Quản lý Kho', value: 'INVENTORY' },
    { label: 'Quản lý Merchant', value: 'MERCHANT' },
    { label: 'Giao gán POS', value: 'ASSIGNMENT' },
    { label: 'Phê duyệt', value: 'APPROVAL' },
    { label: 'Quản trị hệ thống', value: 'SYSTEM' }
  ];

  readonly statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Thành công', value: 'SUCCESS' },
    { label: 'Thất bại', value: 'FAILED' },
    { label: 'Cảnh báo', value: 'WARNING' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'timestamp', header: 'Thời Gian', width: '160px', sortable: true },
    { field: 'username', header: 'Người Thực Hiện', width: '150px' },
    { field: 'userRole', header: 'Vai Trò', width: '130px' },
    { field: 'module', header: 'Phân Hệ', width: '140px' },
    { field: 'action', header: 'Hành Động Tác Động', width: '200px' },
    { field: 'ipAddress', header: 'Địa Chỉ IP', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '120px', align: 'center' },
    { field: 'detail', header: 'Chi Tiết Nhật Ký' }
  ];

  readonly logs = signal<AuditLog[]>([
    { id: '1', timestamp: '2026-03-15 14:22:05', username: 'admin_long', userRole: 'Super Admin', action: 'Tạo phiếu xuất kho EX-2026-004', module: 'INVENTORY', ipAddress: '10.12.5.88', status: 'SUCCESS', detail: 'Xuất kho 15 thiết bị PAX A920 cho Merchant WinMart' },
    { id: '2', timestamp: '2026-03-15 13:05:12', username: 'user_nam', userRole: 'Nhân viên Kho', action: 'Đăng nhập sai mật khẩu', module: 'SYSTEM', ipAddress: '192.168.1.45', status: 'FAILED', detail: 'Đăng nhập thất bại lần thứ 3' },
    { id: '3', timestamp: '2026-03-15 11:40:00', username: 'supervisor_hoa', userRole: 'Trưởng bộ phận', action: 'Phê duyệt hồ sơ REQ-2026-001', module: 'APPROVAL', ipAddress: '10.12.5.90', status: 'SUCCESS', detail: 'Phê duyệt lệnh nhập kho 100 máy POS' }
  ]);

  readonly filteredLogs = computed(() => {
    const user = this.searchUsername().toLowerCase().trim();
    const act = this.searchAction().toLowerCase().trim();
    const mod = this.selectedModule();
    const st = this.selectedStatus();

    return this.logs().filter(item => {
      const matchesUser = !user || item.username.toLowerCase().includes(user);
      const matchesAct = !act || item.action.toLowerCase().includes(act) || item.detail.toLowerCase().includes(act);
      const matchesMod = !mod || item.module === mod;
      const matchesSt = !st || item.status === st;
      return matchesUser && matchesAct && matchesMod && matchesSt;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.systemApi.getAuditLogs({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      username: this.searchUsername(),
      module: this.selectedModule(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.logs.set(res.data.content);
          this.totalItems.set(res.data.totalElements);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onReset(): void {
    this.searchUsername.set('');
    this.searchAction.set('');
    this.selectedModule.set('');
    this.selectedStatus.set('');
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
    this.fileExport.downloadExcel('/monitoring/audit-logs/export', 'Nhat_Ky_Audit_Logs.xlsx', {
      username: this.searchUsername(),
      module: this.selectedModule()
    });
  }
}
