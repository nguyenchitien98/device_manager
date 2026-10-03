import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, DropdownItem, TableColumn
} from '@shared';

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
export class ApprovalInboxPageComponent {
  private readonly router = inject(Router);

  readonly searchRequestCode = signal('');
  readonly searchTitle = signal('');
  readonly selectedType = signal('');
  readonly selectedStatus = signal('PENDING');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

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
    { field: 'actions', header: 'Thao Tác', width: '120px', align: 'center' },
    { field: 'requestCode', header: 'Mã Yêu Cầu', width: '150px', sortable: true },
    { field: 'requestType', header: 'Loại Hồ Sơ', width: '160px' },
    { field: 'title', header: 'Tiêu Đề Trình Duyệt', width: '250px' },
    { field: 'creatorName', header: 'Người Trình Duyệt', width: '160px' },
    { field: 'department', header: 'Đơn Vị', width: '150px' },
    { field: 'createdDate', header: 'Ngày Trình', width: '140px', align: 'center' },
    { field: 'priority', header: 'Độ Ưu Tiên', width: '120px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' }
  ];

  readonly approvals = signal<ApprovalItem[]>([
    { id: '1', requestCode: 'REQ-2026-001', requestType: 'Nhập kho mua mới', title: 'Nhập kho 100 máy PAX A920 đợt 1/2026', creatorName: 'Lê Văn Nam', department: 'Kho Trung Tâm', createdDate: '2026-03-10', priority: 'High', status: 'PENDING' },
    { id: '2', requestCode: 'REQ-2026-002', requestType: 'Xuất kho cấp mới', title: 'Xuất kho 15 máy cho Chi nhánh Ba Đình', creatorName: 'Nguyễn Thị Hoa', department: 'Khối POS', createdDate: '2026-03-12', priority: 'Medium', status: 'PENDING' },
    { id: '3', requestCode: 'REQ-2026-003', requestType: 'Điều chuyển kho', title: 'Điều chuyển 20 máy từ Kho HN vào Kho HCM', creatorName: 'Phạm Minh Tuấn', department: 'Quản Lý Kho', createdDate: '2026-03-08', priority: 'Low', status: 'APPROVED' }
  ]);

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

  getActionItems(item: ApprovalItem): DropdownItem[] {
    return [
      { id: 'view', label: 'Xem & Phê duyệt', icon: 'visibility' },
      { id: 'quick-approve', label: 'Duyệt nhanh', icon: 'check_circle', danger: false },
      { id: 'quick-reject', label: 'Từ chối nhanh', icon: 'cancel', danger: true }
    ];
  }

  onActionClick(item: ApprovalItem, action: DropdownItem): void {
    if (action.id === 'view') {
      this.router.navigate(['/approval/detail', item.id]);
    } else if (action.id === 'quick-approve') {
      this.approvals.update(list => list.map(i => i.id === item.id ? { ...i, status: 'APPROVED' } : i));
    } else if (action.id === 'quick-reject') {
      this.approvals.update(list => list.map(i => i.id === item.id ? { ...i, status: 'REJECTED' } : i));
    }
  }

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchRequestCode.set('');
    this.searchTitle.set('');
    this.selectedType.set('');
    this.selectedStatus.set('PENDING');
    this.currentPage.set(1);
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
    alert('Xuất báo cáo danh sách hồ sơ trình duyệt thành công!');
  }
}
