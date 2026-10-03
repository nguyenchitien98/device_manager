import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface TransferOrder {
  id: string;
  transferCode: string;
  sourceWarehouse: string;
  targetWarehouse: string;
  totalQuantity: number;
  status: 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'PENDING';
  createdByName: string;
  transferDate: string;
}

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './transfer-list.component.html',
  styleUrl: './transfer-list.component.scss'
})
export class TransferListPageComponent {
  private readonly router = inject(Router);

  readonly searchTransferCode = signal('');
  readonly searchWarehouse = signal('');
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
    return this.columns
      .filter(col => col.field !== 'actions' && col.field !== 'transferCode')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
    { label: 'Đang vận chuyển', value: 'IN_TRANSIT' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Chờ duyệt', value: 'PENDING' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' },
    { field: 'transferCode', header: 'Mã Điều Chuyển', width: '150px', sortable: true },
    { field: 'sourceWarehouse', header: 'Kho Xuất Hàng', width: '200px' },
    { field: 'targetWarehouse', header: 'Kho Nhận Hàng', width: '200px' },
    { field: 'totalQuantity', header: 'Số Lượng POS', width: '130px', align: 'center' },
    { field: 'createdByName', header: 'Người Lập Phiếu', width: '160px' },
    { field: 'transferDate', header: 'Ngày Lập', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết', icon: 'visibility' }
  ];

  readonly transfers = signal<TransferOrder[]>([
    { id: '1', transferCode: 'TRF-2026-001', sourceWarehouse: 'Kho Tổng POS Hà Nội', targetWarehouse: 'Kho Chi Nhánh Đà Nẵng', totalQuantity: 100, status: 'COMPLETED', createdByName: 'Nguyễn Văn Hải', transferDate: '2026-02-15' },
    { id: '2', transferCode: 'TRF-2026-002', sourceWarehouse: 'Kho Tổng POS TP.HCM', targetWarehouse: 'Kho Chi Nhánh Cần Thơ', totalQuantity: 50, status: 'IN_TRANSIT', createdByName: 'Trần Thị Thu', transferDate: '2026-03-01' }
  ]);

  readonly filteredTransfers = computed(() => {
    const code = this.searchTransferCode().toLowerCase().trim();
    const wh = this.searchWarehouse().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.transfers().filter(item => {
      const matchCode = !code || item.transferCode.toLowerCase().includes(code);
      const matchWh = !wh || item.sourceWarehouse.toLowerCase().includes(wh) || item.targetWarehouse.toLowerCase().includes(wh);
      const matchSt = !st || item.status === st;
      return matchCode && matchWh && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchTransferCode.set('');
    this.searchWarehouse.set('');
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
    alert('Xuất báo cáo danh sách Điều Chuyển Kho thành công!');
  }

  openCreatePage(): void {
    this.router.navigate(['/inventory/transfers/new']);
  }

  onActionClick(row: TransferOrder, item: DropdownItem): void {
    if (item.id === 'view') {
      alert(`Chi tiết điều chuyển ${row.transferCode}`);
    }
  }
}
