import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  unitType: 'HEADQUARTER' | 'BRANCH' | 'TRANSACTION_OFFICE';
  parentName: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-business-unit-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './business-unit-list.component.html',
  styleUrl: './business-unit-list.component.scss'
})
export class BusinessUnitListPageComponent {
  readonly keyword = signal('');
  readonly selectedType = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Đơn Vị Kinh Doanh' : 'Thêm mới Đơn Vị Kinh Doanh');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<BusinessUnit | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    unitType: 'BRANCH',
    parentName: 'Hội Sở Chính',
    phone: '',
    status: 'ACTIVE'
  };

  readonly typeOptions: SelectOption[] = [
    { label: 'Tất cả loại đơn vị', value: '' },
    { label: 'Hội sở chính (HQ)', value: 'HEADQUARTER' },
    { label: 'Chi nhánh (Branch)', value: 'BRANCH' },
    { label: 'Phòng giao dịch (PGD)', value: 'TRANSACTION_OFFICE' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã Đơn Vị', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Đơn Vị Kinh Doanh', width: '250px', sortable: true },
    { field: 'unitType', header: 'Phân Loại', width: '170px', align: 'center' },
    { field: 'parentName', header: 'Đơn Vị Quản Lý Cấp Trên', width: '200px' },
    { field: 'phone', header: 'Điện Thoại', width: '130px' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa đơn vị', icon: 'delete', danger: true }
  ];

  readonly units = signal<BusinessUnit[]>([
    { id: '1', code: 'BU_HO', name: 'Hội Sở Chính Ngân Hàng', unitType: 'HEADQUARTER', parentName: '—', phone: '024 3942 5555', status: 'ACTIVE', createdAt: '2026-01-01' },
    { id: '2', code: 'BU_CN_HN', name: 'Chi Nhánh Hà Nội', unitType: 'BRANCH', parentName: 'Hội Sở Chính Ngân Hàng', phone: '024 3825 1111', status: 'ACTIVE', createdAt: '2026-01-05' },
    { id: '3', code: 'BU_CN_HCM', name: 'Chi Nhánh TP. Hồ Chí Minh', unitType: 'BRANCH', parentName: 'Hội Sở Chính Ngân Hàng', phone: '028 3829 2222', status: 'ACTIVE', createdAt: '2026-01-05' },
    { id: '4', code: 'BU_PGD_HK', name: 'PGD Hoàn Kiếm', unitType: 'TRANSACTION_OFFICE', parentName: 'Chi Nhánh Hà Nội', phone: '024 3933 4444', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '5', code: 'BU_PGD_Q1', name: 'PGD Quận 1 Bến Thành', unitType: 'TRANSACTION_OFFICE', parentName: 'Chi Nhánh TP. Hồ Chí Minh', phone: '028 3822 5555', status: 'ACTIVE', createdAt: '2026-01-12' }
  ]);

  readonly filteredUnits = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const tp = this.selectedType();
    return this.units().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw);
      const matchTp = !tp || item.unitType === tp;
      return matchKw && matchTp;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedType.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', unitType: 'BRANCH', parentName: 'Hội Sở Chính Ngân Hàng', phone: '', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: BusinessUnit): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.units.update(list => list.map(u => u.id === this.formModel.id ? { ...u, ...this.formModel } as BusinessUnit : u));
      } else {
        const newItem: BusinessUnit = {
          ...this.formModel as BusinessUnit,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.units.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: BusinessUnit, item: DropdownItem): void {
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
      this.units.update(list => list.filter(u => u.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
