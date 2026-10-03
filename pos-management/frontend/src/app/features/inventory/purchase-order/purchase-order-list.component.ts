import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  deviceModel: string;
  quantity: number;
  totalValue: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  orderDate: string;
}

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss'
})
export class PurchaseOrderListPageComponent {
  readonly filterPoNumber = signal('');
  readonly selectedVendor = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Đơn Mua POS (PO)' : 'Thêm mới Đơn Mua POS (PO)');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<PurchaseOrder | null>(null);

  formModel = {
    id: '',
    poNumber: '',
    vendorName: 'PAX Technology',
    deviceModel: 'PAX A920 Pro',
    quantity: 100,
    totalValue: 550000000,
    status: 'PENDING'
  };

  readonly vendorOptions: SelectOption[] = [
    { label: 'Tất cả nhà cung cấp', value: '' },
    { label: 'PAX Technology', value: 'PAX Technology' },
    { label: 'Verifone Vietnam', value: 'Verifone Vietnam' },
    { label: 'Ingenico Group', value: 'Ingenico Group' }
  ];

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chờ duyệt', value: 'PENDING' },
    { label: 'Đã duyệt', value: 'APPROVED' },
    { label: 'Hoàn tất nhập kho', value: 'COMPLETED' }
  ];

  readonly allColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' },
    { field: 'poNumber', header: 'Số Đơn Hàng (PO)', width: '160px', sortable: true },
    { field: 'vendorName', header: 'Nhà Cung Cấp', width: '200px' },
    { field: 'deviceModel', header: 'Model Đặt Mua', width: '180px' },
    { field: 'quantity', header: 'Số Lượng', width: '120px', align: 'center' },
    { field: 'totalValue', header: 'Tổng Giá Trị (VNĐ)', width: '180px', align: 'right' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' },
    { field: 'orderDate', header: 'Ngày Đặt', width: '130px', align: 'center' }
  ];

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.allColumns.filter(c => !hidden.has(c.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.allColumns
      .filter(col => col.field !== 'actions' && col.field !== 'poNumber')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'bi bi-pencil' },
    { id: 'delete', label: 'Xóa đơn hàng', icon: 'bi bi-trash', danger: true }
  ];

  readonly orders = signal<PurchaseOrder[]>([
    { id: '1', poNumber: 'PO-2026-001', vendorName: 'PAX Technology', deviceModel: 'PAX A920 Pro', quantity: 100, totalValue: 550000000, status: 'PENDING', orderDate: '2026-01-10' },
    { id: '2', poNumber: 'PO-2026-002', vendorName: 'Verifone Vietnam', deviceModel: 'Verifone VX520', quantity: 50, totalValue: 175000000, status: 'APPROVED', orderDate: '2026-01-15' },
    { id: '3', poNumber: 'PO-2026-003', vendorName: 'Ingenico Group', deviceModel: 'AXIUM DX8000', quantity: 200, totalValue: 1200000000, status: 'COMPLETED', orderDate: '2026-02-01' }
  ]);

  readonly filteredOrders = computed(() => {
    const po = this.filterPoNumber().toLowerCase().trim();
    const v = this.selectedVendor();
    const st = this.selectedStatus();

    return this.orders().filter(item => {
      const matchPo = !po || item.poNumber.toLowerCase().includes(po);
      const matchVendor = !v || item.vendorName === v;
      const matchStatus = !st || item.status === st;
      return matchPo && matchVendor && matchStatus;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.filterPoNumber.set(''); this.selectedVendor.set(''); this.selectedStatus.set(''); this.currentPage.set(1); }
  onExportExcel(): void {}

  toggleColumn(item: DropdownItem): void {
    this.hiddenColumns.update(set => {
      const next = new Set(set);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', poNumber: '', vendorName: 'PAX Technology', deviceModel: 'PAX A920 Pro', quantity: 100, totalValue: 550000000, status: 'PENDING' };
    this.showModal.set(true);
  }

  openEditModal(item: PurchaseOrder): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.orders.update(list => list.map(o => o.id === this.formModel.id ? { ...o, ...this.formModel } as PurchaseOrder : o));
      } else {
        const newItem: PurchaseOrder = {
          ...this.formModel as PurchaseOrder,
          id: String(Date.now()),
          orderDate: new Date().toISOString().split('T')[0]
        };
        this.orders.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: PurchaseOrder, item: DropdownItem): void {
    if (item.id === 'edit') this.openEditModal(row);
    else if (item.id === 'delete') {
      this.selectedItem.set(row);
      this.showDeleteConfirm.set(true);
    }
  }

  onConfirmDelete(): void {
    const target = this.selectedItem();
    if (!target) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.orders.update(list => list.filter(o => o.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
