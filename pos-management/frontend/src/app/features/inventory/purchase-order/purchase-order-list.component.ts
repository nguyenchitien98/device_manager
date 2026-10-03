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
  totalQuantity: number;
  totalAmountVnd: number;
  status: 'DRAFT' | 'APPROVED' | 'IMPORTED' | 'REJECTED';
  orderDate: string;
  expectedDeliveryDate: string;
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
  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Đơn Mua Hàng PO' : 'Tạo Đơn Mua Hàng PO Mới');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<PurchaseOrder | null>(null);

  formModel = {
    id: '',
    poNumber: '',
    vendorName: 'PAX Technology Ltd',
    totalQuantity: 500,
    totalAmountVnd: 2500000000,
    status: 'DRAFT',
    expectedDeliveryDate: '2026-04-30'
  };

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Bản nháp (Draft)', value: 'DRAFT' },
    { label: 'Đã duyệt (Approved)', value: 'APPROVED' },
    { label: 'Đã nhập kho (Imported)', value: 'IMPORTED' },
    { label: 'Từ chối (Rejected)', value: 'REJECTED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'poNumber', header: 'Số Đơn PO', width: '150px', sortable: true },
    { field: 'vendorName', header: 'Nhà Cung Cấp', width: '200px', sortable: true },
    { field: 'totalQuantity', header: 'Số Lượng POS', width: '140px', align: 'center' },
    { field: 'totalAmountVnd', header: 'Tổng Giá Trị (VND)', width: '180px', align: 'right' },
    { field: 'orderDate', header: 'Ngày Đặt', width: '130px', align: 'center' },
    { field: 'expectedDeliveryDate', header: 'Dự Kiến Giao', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết', icon: 'visibility' },
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Hủy đơn PO', icon: 'delete', danger: true }
  ];

  readonly orders = signal<PurchaseOrder[]>([
    { id: '1', poNumber: 'PO-2026-001', vendorName: 'PAX Technology Ltd', totalQuantity: 1000, totalAmountVnd: 4500000000, status: 'IMPORTED', orderDate: '2026-01-05', expectedDeliveryDate: '2026-01-25' },
    { id: '2', poNumber: 'PO-2026-002', vendorName: 'Ingenico Group SA', totalQuantity: 500, totalAmountVnd: 3200000000, status: 'APPROVED', orderDate: '2026-02-01', expectedDeliveryDate: '2026-03-01' },
    { id: '3', poNumber: 'PO-2026-003', vendorName: 'Verifone Systems Inc', totalQuantity: 300, totalAmountVnd: 1200000000, status: 'DRAFT', orderDate: '2026-03-01', expectedDeliveryDate: '2026-04-05' },
    { id: '4', poNumber: 'PO-2026-004', vendorName: 'Landi Commercial', totalQuantity: 2000, totalAmountVnd: 1800000000, status: 'APPROVED', orderDate: '2026-03-10', expectedDeliveryDate: '2026-04-15' }
  ]);

  readonly filteredOrders = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.orders().filter(item => {
      const matchKw = !kw || item.poNumber.toLowerCase().includes(kw) || item.vendorName.toLowerCase().includes(kw);
      const matchSt = !st || item.status === st;
      return matchKw && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedStatus.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', poNumber: 'PO-2026-00' + (this.orders().length + 1), vendorName: 'PAX Technology Ltd', totalQuantity: 500, totalAmountVnd: 2500000000, status: 'DRAFT', expectedDeliveryDate: '2026-04-30' };
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
