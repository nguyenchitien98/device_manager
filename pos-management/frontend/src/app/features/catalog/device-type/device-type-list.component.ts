import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface DeviceType {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  connectionType: '4G/WIFI' | 'BLUETOOTH' | 'DIAL-UP/LAN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-device-type-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './device-type-list.component.html',
  styleUrl: './device-type-list.component.scss'
})
export class DeviceTypeListPageComponent {
  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly selectedCategory = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Loại Thiết Bị' : 'Thêm mới Loại Thiết Bị');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<DeviceType | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    categoryName: 'Smart POS Android',
    connectionType: '4G/WIFI',
    status: 'ACTIVE'
  };

  readonly categoryOptions: SelectOption[] = [
    { label: 'Tất cả danh mục', value: '' },
    { label: 'Smart POS Android', value: 'Smart POS Android' },
    { label: 'POS Truyền Thống', value: 'POS Truyền Thống' },
    { label: 'mPOS Di Động', value: 'mPOS Di Động' },
    { label: 'Soundbox Loa QR', value: 'Soundbox Loa QR' }
  ];

  readonly allColumns: TableColumn[] = [
    { field: 'code', header: 'Mã Loại', width: '150px', sortable: true },
    { field: 'name', header: 'Tên Loại Thiết Bị', width: '220px', sortable: true },
    { field: 'categoryName', header: 'Thuộc Danh Mục', width: '200px' },
    { field: 'connectionType', header: 'Kết Nối', width: '150px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '140px', align: 'center' },
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
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'bi bi-pencil' },
    { id: 'delete', label: 'Xóa loại thiết bị', icon: 'bi bi-trash', danger: true }
  ];

  readonly deviceTypes = signal<DeviceType[]>([
    { id: '1', code: 'TYPE_ANDROID_HANDHELD', name: 'Smart POS Cầm Tay 4G', categoryName: 'Smart POS Android', connectionType: '4G/WIFI', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '2', code: 'TYPE_ANDROID_COUNTER', name: 'Smart POS Quầy Đôi Màn Hình', categoryName: 'Smart POS Android', connectionType: '4G/WIFI', status: 'ACTIVE', createdAt: '2026-01-18' },
    { id: '3', code: 'TYPE_DESK_LAN', name: 'POS Để Bàn Cố Định LAN', categoryName: 'POS Truyền Thống', connectionType: 'DIAL-UP/LAN', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '4', code: 'TYPE_MPOS_BT', name: 'mPOS Kết Nối Bluetooth', categoryName: 'mPOS Di Động', connectionType: 'BLUETOOTH', status: 'ACTIVE', createdAt: '2026-02-05' },
    { id: '5', code: 'TYPE_SOUNDBOX_LED', name: 'Loa QR Màn Hình Hiển Thị LED', categoryName: 'Soundbox Loa QR', connectionType: '4G/WIFI', status: 'ACTIVE', createdAt: '2026-02-20' }
  ]);

  readonly filteredTypes = computed(() => {
    const fc = this.filterCode().toLowerCase().trim();
    const fn = this.filterName().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.deviceTypes().filter(item => {
      const matchCode = !fc || item.code.toLowerCase().includes(fc);
      const matchName = !fn || item.name.toLowerCase().includes(fn);
      const matchCat = !cat || item.categoryName === cat;
      return matchCode && matchName && matchCat;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.filterCode.set(''); this.filterName.set(''); this.selectedCategory.set(''); this.currentPage.set(1); }
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
    this.formModel = { id: '', code: '', name: '', categoryName: 'Smart POS Android', connectionType: '4G/WIFI', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: DeviceType): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.deviceTypes.update(list => list.map(t => t.id === this.formModel.id ? { ...t, ...this.formModel } as DeviceType : t));
      } else {
        const newItem: DeviceType = {
          ...this.formModel as DeviceType,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.deviceTypes.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: DeviceType, item: DropdownItem): void {
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
      this.deviceTypes.update(list => list.filter(t => t.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
