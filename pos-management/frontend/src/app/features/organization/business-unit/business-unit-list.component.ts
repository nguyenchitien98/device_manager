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
  managerName: string;
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
    PosButtonComponent, PosInputComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './business-unit-list.component.html',
  styleUrl: './business-unit-list.component.scss'
})
export class BusinessUnitListPageComponent {
  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly hiddenColumns = signal<Set<string>>(new Set());

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
    managerName: '',
    phone: '',
    status: 'ACTIVE'
  };

  readonly allColumns: TableColumn[] = [
    { field: 'code', header: 'Mã Đơn Vị', width: '140px', sortable: true },
    { field: 'name', header: 'Tên Đơn Vị Kinh Doanh', width: '250px', sortable: true },
    { field: 'managerName', header: 'Trưởng Đơn Vị', width: '180px' },
    { field: 'phone', header: 'Số Điện Thoại', width: '140px' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '130px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.allColumns.filter(c => !hidden.has(c.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.allColumns.map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '[ Ẩn ] ' : '[ Hiển thị ] ') + col.header,
      icon: hidden.has(col.field) ? 'bi bi-square' : 'bi bi-check-square-fill'
    }));
  });

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'bi bi-pencil' },
    { id: 'delete', label: 'Xóa đơn vị', icon: 'bi bi-trash', danger: true }
  ];

  readonly units = signal<BusinessUnit[]>([
    { id: '1', code: 'BU_HN_CENTER', name: 'Khối POS Trung Tâm Hà Nội', managerName: 'Nguyễn Văn Nam', phone: '0912345678', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '2', code: 'BU_HCM_CENTER', name: 'Khối POS Trung Tâm TP.HCM', managerName: 'Trần Thị Thu', phone: '0987654321', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '3', code: 'BU_DN_BRANCH', name: 'Chi Nhánh POS Đà Nẵng', managerName: 'Phạm Minh Tuấn', phone: '0903112233', status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredUnits = computed(() => {
    const fc = this.filterCode().toLowerCase().trim();
    const fn = this.filterName().toLowerCase().trim();
    return this.units().filter(item => {
      const matchCode = !fc || item.code.toLowerCase().includes(fc);
      const matchName = !fn || item.name.toLowerCase().includes(fn);
      return matchCode && matchName;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.filterCode.set(''); this.filterName.set(''); this.currentPage.set(1); }
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
    this.formModel = { id: '', code: '', name: '', managerName: '', phone: '', status: 'ACTIVE' };
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
