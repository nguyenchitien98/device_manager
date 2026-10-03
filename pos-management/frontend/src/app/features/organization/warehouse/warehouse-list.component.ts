import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouseType: 'MAIN' | 'BRANCH' | 'TRANSIT';
  businessUnitName: string;
  address: string;
  managerName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './warehouse-list.component.html',
  styleUrl: './warehouse-list.component.scss'
})
export class WarehouseListPageComponent {
  readonly keyword = signal('');
  readonly selectedType = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Kho Hàng' : 'Thêm mới Kho Hàng');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<Warehouse | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    warehouseType: 'MAIN',
    businessUnitName: 'Hội Sở Chính Ngân Hàng',
    address: '',
    managerName: '',
    status: 'ACTIVE'
  };

  readonly typeOptions: SelectOption[] = [
    { label: 'Tất cả loại kho', value: '' },
    { label: 'Kho Tổng (Central Warehouse)', value: 'MAIN' },
    { label: 'Kho Chi Nhánh (Branch)', value: 'BRANCH' },
    { label: 'Kho Trung Chuyển (Transit)', value: 'TRANSIT' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã Kho', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Kho Hàng', width: '220px', sortable: true },
    { field: 'warehouseType', header: 'Loại Kho', width: '150px', align: 'center' },
    { field: 'businessUnitName', header: 'Trực Thuộc BU', width: '200px' },
    { field: 'managerName', header: 'Quản Lý Kho', width: '150px' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa kho', icon: 'delete', danger: true }
  ];

  readonly warehouses = signal<Warehouse[]>([
    { id: '1', code: 'WH_MAIN_HN', name: 'Kho Tổng POS Hà Nội', warehouseType: 'MAIN', businessUnitName: 'Hội Sở Chính Ngân Hàng', address: 'Số 1 Láng Hạ, Ba Đình, Hà Nội', managerName: 'Nguyễn Văn Hải', status: 'ACTIVE', createdAt: '2026-01-01' },
    { id: '2', code: 'WH_MAIN_HCM', name: 'Kho Tổng POS TP.HCM', warehouseType: 'MAIN', businessUnitName: 'Hội Sở Chính Ngân Hàng', address: '123 Lê Lợi, Q.1, TP.HCM', managerName: 'Trần Thị Thu', status: 'ACTIVE', createdAt: '2026-01-05' },
    { id: '3', code: 'WH_BRANCH_DN', name: 'Kho Chi Nhánh Đà Nẵng', warehouseType: 'BRANCH', businessUnitName: 'Chi Nhánh Đà Nẵng', address: '45 Nguyễn Văn Linh, Đà Nẵng', managerName: 'Lê Hoàng Nam', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '4', code: 'WH_TRANSIT_MB', name: 'Kho Trung Chuyển Miền Bắc', warehouseType: 'TRANSIT', businessUnitName: 'Hội Sở Chính Ngân Hàng', address: 'KCN Bắc Thăng Long, Hà Nội', managerName: 'Phạm Quốc Bảo', status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredWarehouses = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const tp = this.selectedType();
    return this.warehouses().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw);
      const matchTp = !tp || item.warehouseType === tp;
      return matchKw && matchTp;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedType.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', warehouseType: 'MAIN', businessUnitName: 'Hội Sở Chính Ngân Hàng', address: '', managerName: '', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: Warehouse): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.warehouses.update(list => list.map(w => w.id === this.formModel.id ? { ...w, ...this.formModel } as Warehouse : w));
      } else {
        const newItem: Warehouse = {
          ...this.formModel as Warehouse,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.warehouses.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: Warehouse, item: DropdownItem): void {
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
      this.warehouses.update(list => list.filter(w => w.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
