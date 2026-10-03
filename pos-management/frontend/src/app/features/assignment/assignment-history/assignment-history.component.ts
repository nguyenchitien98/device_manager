import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  TableColumn
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
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent
  ],
  templateUrl: './assignment-history.component.html',
  styleUrl: './assignment-history.component.scss'
})
export class AssignmentHistoryPageComponent {
  readonly keyword = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

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
    const kw = this.keyword().toLowerCase().trim();
    return this.historyRecords().filter(item => {
      return !kw || item.assignmentCode.toLowerCase().includes(kw) || item.merchantName.toLowerCase().includes(kw) || item.posSerial.toLowerCase().includes(kw);
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.currentPage.set(1); }
}
