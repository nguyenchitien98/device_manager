import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface ImportOrder {
  id: string;
  importCode: string;
  poNumber: string;
  warehouseName: string;
  totalQuantity: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdByName: string;
  importDate: string;
}

@Component({
  selector: 'app-import-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './import-list.component.html',
  styleUrl: './import-list.component.scss'
})
export class ImportListPageComponent {
  private readonly router = inject(Router);

  readonly searchImportCode = signal('');
  readonly searchPoNumber = signal('');
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
      .filter(col => col.field !== 'actions' && col.field !== 'importCode')
      .map(col => ({
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
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'importCode', header: 'Mã Phiếu Nhập', width: '150px', sortable: true },
    { field: 'poNumber', header: 'Số Đơn PO', width: '140px' },
    { field: 'warehouseName', header: 'Kho Nhập Hàng', width: '220px' },
    { field: 'totalQuantity', header: 'Số Lượng POS', width: '130px', align: 'center' },
    { field: 'createdByName', header: 'Người Lập Phiếu', width: '160px' },
    { field: 'importDate', header: 'Ngày Nhập', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết phiếu', icon: 'visibility' }
  ];

  readonly imports = signal<ImportOrder[]>([
    { id: '1', importCode: 'IMP-2026-001', poNumber: 'PO-2026-001', warehouseName: 'Kho Tổng POS Hà Nội', totalQuantity: 1000, status: 'APPROVED', createdByName: 'Nguyễn Văn Hải', importDate: '2026-01-25' },
    { id: '2', importCode: 'IMP-2026-002', poNumber: 'PO-2026-002', warehouseName: 'Kho Tổng POS TP.HCM', totalQuantity: 500, status: 'PENDING', createdByName: 'Trần Thị Thu', importDate: '2026-02-10' }
  ]);

  readonly filteredImports = computed(() => {
    const code = this.searchImportCode().toLowerCase().trim();
    const po = this.searchPoNumber().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.imports().filter(item => {
      const matchCode = !code || item.importCode.toLowerCase().includes(code);
      const matchPo = !po || item.poNumber.toLowerCase().includes(po);
      const matchSt = !st || item.status === st;
      return matchCode && matchPo && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchImportCode.set('');
    this.searchPoNumber.set('');
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
    alert('Xuất báo cáo danh sách Nhập Kho thành công!');
  }

  openCreatePage(): void {
    this.router.navigate(['/inventory/import-create']);
  }

  onActionClick(row: ImportOrder, item: DropdownItem): void {
    if (item.id === 'view') {
      alert(`Chi tiết phiếu nhập ${row.importCode}: Tổng ${row.totalQuantity} thiết bị POS.`);
    }
  }
}
