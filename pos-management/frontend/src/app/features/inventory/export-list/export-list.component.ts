import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface ExportOrder {
  id: string;
  exportCode: string;
  destinationName: string;
  exportType: 'MERCHANT' | 'TRANSFER' | 'MAINTENANCE';
  totalQuantity: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdByName: string;
  exportDate: string;
}

@Component({
  selector: 'app-export-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './export-list.component.html',
  styleUrl: './export-list.component.scss'
})
export class ExportListPageComponent {
  private readonly router = inject(Router);

  readonly searchExportCode = signal('');
  readonly searchDestination = signal('');
  readonly selectedStatus = signal('');
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

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã hoàn thành', value: 'APPROVED' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Từ chối', value: 'REJECTED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'exportCode', header: 'Mã Phiếu Xuất', width: '150px', sortable: true },
    { field: 'destinationName', header: 'Nơi Nhận / Merchant / Kho', width: '240px' },
    { field: 'exportType', header: 'Mục Đích Xuất', width: '160px', align: 'center' },
    { field: 'totalQuantity', header: 'Số Lượng POS', width: '130px', align: 'center' },
    { field: 'createdByName', header: 'Người Lập Phiếu', width: '160px' },
    { field: 'exportDate', header: 'Ngày Xuất', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết phiếu', icon: 'visibility' }
  ];

  readonly exports = signal<ExportOrder[]>([
    { id: '1', exportCode: 'EXP-2026-001', destinationName: 'WinMart Thăng Long (MID_88880001)', exportType: 'MERCHANT', totalQuantity: 12, status: 'APPROVED', createdByName: 'Nguyễn Văn Hải', exportDate: '2026-01-10' },
    { id: '2', exportCode: 'EXP-2026-002', destinationName: 'Kho Chi Nhánh Đà Nẵng', exportType: 'TRANSFER', totalQuantity: 100, status: 'APPROVED', createdByName: 'Trần Thị Thu', exportDate: '2026-02-15' }
  ]);

  readonly filteredExports = computed(() => {
    const code = this.searchExportCode().toLowerCase().trim();
    const dest = this.searchDestination().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.exports().filter(item => {
      const matchCode = !code || item.exportCode.toLowerCase().includes(code);
      const matchDest = !dest || item.destinationName.toLowerCase().includes(dest);
      const matchSt = !st || item.status === st;
      return matchCode && matchDest && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchExportCode.set('');
    this.searchDestination.set('');
    this.selectedStatus.set('');
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
    alert('Xuất báo cáo danh sách Xuất Kho thành công!');
  }

  openCreatePage(): void {
    this.router.navigate(['/inventory/exports/new']);
  }

  onActionClick(row: ExportOrder, item: DropdownItem): void {
    if (item.id === 'view') {
      alert(`Chi tiết phiếu xuất ${row.exportCode}`);
    }
  }
}
