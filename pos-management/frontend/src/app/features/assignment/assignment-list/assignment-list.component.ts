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

  readonly keyword = signal('');
  readonly selectedType = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly typeOptions: SelectOption[] = [
    { label: 'Tất cả loại lệnh', value: '' },
    { label: 'Cấp phát mới (Assign)', value: 'ASSIGN' },
    { label: 'Thu hồi thiết bị (Reclaim)', value: 'RECLAIM' },
    { label: 'Đổi máy hỏng (Replace)', value: 'REPLACE' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'assignmentCode', header: 'Mã Lệnh', width: '150px', sortable: true },
    { field: 'actionType', header: 'Loại Hành Động', width: '170px', align: 'center' },
    { field: 'merchantName', header: 'Merchant Tương Tác', width: '220px' },
    { field: 'tid', header: 'Mã TID', width: '120px', align: 'center' },
    { field: 'posSerial', header: 'Serial POS Gán', width: '170px' },
    { field: 'createdByName', header: 'Người Thực Hiện', width: '160px' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết lệnh', icon: 'visibility' }
  ];

  readonly assignments = signal<AssignmentItem[]>([
    { id: '1', assignmentCode: 'ASN-2026-001', actionType: 'ASSIGN', merchantName: 'WinMart Thăng Long', tid: 'TID_8801', posSerial: 'PAX-A920-998822', status: 'COMPLETED', createdByName: 'Nguyễn Văn Hải', createdDate: '2026-01-10' },
    { id: '2', assignmentCode: 'ASN-2026-002', actionType: 'REPLACE', merchantName: 'Phúc Long Coffee & Tea', tid: 'TID_8803', posSerial: 'ING-DX8-771199', status: 'PENDING_APPROVAL', createdByName: 'Trần Thị Thu', createdDate: '2026-03-01' }
  ]);

  readonly filteredAssignments = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const tp = this.selectedType();
    return this.assignments().filter(item => {
      const matchKw = !kw || item.assignmentCode.toLowerCase().includes(kw) || item.merchantName.toLowerCase().includes(kw) || item.tid.toLowerCase().includes(kw) || item.posSerial.toLowerCase().includes(kw);
      const matchTp = !tp || item.actionType === tp;
      return matchKw && matchTp;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedType.set(''); this.currentPage.set(1); }

  openCreatePage(): void {
    this.router.navigate(['/assignment/new']);
  }

  onActionClick(row: AssignmentItem, item: DropdownItem): void {
    if (item.id === 'view') {
      alert(`Chi tiết lệnh assignment ${row.assignmentCode}`);
    }
  }
}
