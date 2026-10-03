import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  TableColumn
} from '@shared';

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
    PosBadgeComponent, PosTableComponent, PosPaginationComponent
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss'
})
export class AuditLogListPageComponent {
  readonly keyword = signal('');
  readonly selectedModule = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

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
    const kw = this.keyword().toLowerCase().trim();
    const mod = this.selectedModule();
    const st = this.selectedStatus();

    return this.logs().filter(item => {
      const matchesKw = !kw || item.username.toLowerCase().includes(kw) || item.action.toLowerCase().includes(kw) || item.detail.toLowerCase().includes(kw);
      const matchesMod = !mod || item.module === mod;
      const matchesSt = !st || item.status === st;
      return matchesKw && matchesMod && matchesSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedModule.set(''); this.selectedStatus.set(''); this.currentPage.set(1); }
}
