import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, DropdownItem
} from '@shared';

export interface AssignmentHistoryRecord {
  id: string;
  assignmentCode: string;
  actionType: string;
  merchantName: string;
  tid: string;
  posSerial: string;
  operatorName: string;
  eventDate: string;
  note: string;
}

@Component({
  selector: 'app-assignment-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './assignment-history.component.html',
  styleUrl: './assignment-history.component.scss'
})
export class AssignmentHistoryPageComponent {
  readonly searchAssignmentCode = signal('');
  readonly searchMerchant = signal('');
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
    return this.columns.map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly columns: TableColumn[] = [
    { field: 'assignmentCode', header: 'Mã Lệnh', width: '150px', sortable: true },
    { field: 'actionType', header: 'Hành Động', width: '140px', align: 'center' },
    { field: 'merchantName', header: 'Merchant Tương Tác', width: '220px' },
    { field: 'tid', header: 'Mã TID', width: '120px', align: 'center' },
    { field: 'posSerial', header: 'Serial POS', width: '170px' },
    { field: 'operatorName', header: 'Thực Hiện Bởi', width: '160px' },
    { field: 'eventDate', header: 'Thời Gian', width: '150px', align: 'center' },
    { field: 'note', header: 'Ghi Chú Nhật Ký' }
  ];

  readonly historyRecords = signal<AssignmentHistoryRecord[]>([
    { id: '1', assignmentCode: 'ASN-2026-001', actionType: 'Cấp mới', merchantName: 'WinMart Thăng Long', tid: 'TID_8801', posSerial: 'PAX-A920-998822', operatorName: 'Nguyễn Văn Hải', eventDate: '2026-01-10 14:30', note: 'Bàn giao thiết bị hoạt động bình thường' },
    { id: '2', assignmentCode: 'ASN-2026-002', actionType: 'Đổi máy', merchantName: 'Phúc Long Coffee & Tea', tid: 'TID_8803', posSerial: 'ING-DX8-771199', operatorName: 'Trần Thị Thu', eventDate: '2026-03-01 10:15', note: 'Thay thế máy POS cũ bị lỗi màn hình cảm ứng' }
  ]);

  readonly filteredHistory = computed(() => {
    const code = this.searchAssignmentCode().toLowerCase().trim();
    const merchant = this.searchMerchant().toLowerCase().trim();
    return this.historyRecords().filter(item => {
      const matchCode = !code || item.assignmentCode.toLowerCase().includes(code);
      const matchMerchant = !merchant || item.merchantName.toLowerCase().includes(merchant) || item.posSerial.toLowerCase().includes(merchant);
      return matchCode && matchMerchant;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchAssignmentCode.set('');
    this.searchMerchant.set('');
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
    alert('Xuất báo cáo nhật ký bàn giao terminal thành công!');
  }
}
