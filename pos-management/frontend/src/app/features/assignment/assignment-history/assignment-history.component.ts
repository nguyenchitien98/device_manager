import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, DropdownItem
} from '@shared';
import { AssignmentApiService } from '../../../core/services/api/assignment-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

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
export class AssignmentHistoryPageComponent implements OnInit {
  private readonly assignmentApi = inject(AssignmentApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchAssignmentCode = signal('');
  readonly searchMerchant = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(2);
  readonly sortField = signal('eventDate');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => col.field !== 'assignmentCode').map(col => ({
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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.assignmentApi.getAssignmentHistory({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.searchAssignmentCode()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.historyRecords.set(res.data.content);
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
    this.searchAssignmentCode.set('');
    this.searchMerchant.set('');
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
    this.fileExport.downloadExcel('/assignments/history/export', 'Nhat_Ky_Terminal_Assignment.xlsx', {
      code: this.searchAssignmentCode()
    });
  }
}
