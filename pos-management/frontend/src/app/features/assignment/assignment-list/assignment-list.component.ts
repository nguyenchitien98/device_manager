import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface AssignmentItem {
  id: string;
  assignmentCode: string;
  actionType: 'ASSIGN' | 'RECLAIM' | 'REPLACE';
  merchantName: string;
  tid: string;
  posSerial: string;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'REJECTED';
  createdByName: string;
  createdDate: string;
}

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './assignment-list.component.html',
  styleUrl: './assignment-list.component.scss'
})
export class AssignmentListPageComponent {
  private readonly router = inject(Router);

  readonly searchAssignmentCode = signal('');
  readonly searchMerchant = signal('');
  readonly selectedType = signal('');
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
    return this.columns.filter(col => col.field !== 'actions' && col.field !== 'assignmentCode').map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly typeOptions: SelectOption[] = [
    { label: 'Tất cả loại lệnh', value: '' },
    { label: 'Cấp phát mới (Assign)', value: 'ASSIGN' },
    { label: 'Thu hồi thiết bị (Reclaim)', value: 'RECLAIM' },
    { label: 'Đổi máy hỏng (Replace)', value: 'REPLACE' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'assignmentCode', header: 'Mã Lệnh', width: '150px', sortable: true },
    { field: 'actionType', header: 'Loại Hành Động', width: '170px', align: 'center' },
    { field: 'merchantName', header: 'Merchant Tương Tác', width: '220px' },
    { field: 'tid', header: 'Mã TID', width: '120px', align: 'center' },
    { field: 'posSerial', header: 'Serial POS Gán', width: '170px' },
    { field: 'createdByName', header: 'Người Thực Hiện', width: '160px' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết lệnh', icon: 'visibility' }
  ];

  readonly assignments = signal<AssignmentItem[]>([
    { id: '1', assignmentCode: 'ASN-2026-001', actionType: 'ASSIGN', merchantName: 'WinMart Thăng Long', tid: 'TID_8801', posSerial: 'PAX-A920-998822', status: 'COMPLETED', createdByName: 'Nguyễn Văn Hải', createdDate: '2026-01-10' },
    { id: '2', assignmentCode: 'ASN-2026-002', actionType: 'REPLACE', merchantName: 'Phúc Long Coffee & Tea', tid: 'TID_8803', posSerial: 'ING-DX8-771199', status: 'PENDING_APPROVAL', createdByName: 'Trần Thị Thu', createdDate: '2026-03-01' }
  ]);

  readonly filteredAssignments = computed(() => {
    const code = this.searchAssignmentCode().toLowerCase().trim();
    const merchant = this.searchMerchant().toLowerCase().trim();
    const tp = this.selectedType();
    return this.assignments().filter(item => {
      const matchCode = !code || item.assignmentCode.toLowerCase().includes(code);
      const matchMerchant = !merchant || item.merchantName.toLowerCase().includes(merchant) || item.tid.toLowerCase().includes(merchant) || item.posSerial.toLowerCase().includes(merchant);
      const matchTp = !tp || item.actionType === tp;
      return matchCode && matchMerchant && matchTp;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchAssignmentCode.set('');
    this.searchMerchant.set('');
    this.selectedType.set('');
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
    alert('Xuất báo cáo danh sách lệnh Assignment thành công!');
  }

  openCreatePage(): void {
    this.router.navigate(['/assignment/new']);
  }

  onActionClick(row: AssignmentItem, item: DropdownItem): void {
    if (item.id === 'view') {
      alert(`Chi tiết lệnh assignment ${row.assignmentCode}`);
    }
  }
}
