import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface DeviceModel {
  id: string;
  code: string;
  name: string;
  vendorName: string;
  typeName: string;
  ramMb: number;
  storageMb: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-device-model-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './device-model-list.component.html',
  styleUrl: './device-model-list.component.scss'
})
export class DeviceModelListPageComponent {
  readonly keyword = signal('');
  readonly selectedVendor = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Model Thiết Bị' : 'Thêm mới Model Thiết Bị');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<DeviceModel | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    vendorName: 'PAX Technology',
    typeName: 'Smart POS Cầm Tay 4G',
    ramMb: 2048,
    storageMb: 16384,
    status: 'ACTIVE'
  };

  readonly vendorOptions: SelectOption[] = [
    { label: 'Tất cả Vendor', value: '' },
    { label: 'PAX Technology', value: 'PAX Technology' },
    { label: 'Ingenico', value: 'Ingenico' },
    { label: 'Verifone', value: 'Verifone' },
    { label: 'Landi', value: 'Landi' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã Model', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Model', width: '200px', sortable: true },
    { field: 'vendorName', header: 'Nhà Sản Xuất', width: '160px' },
    { field: 'typeName', header: 'Loại Thiết Bị', width: '180px' },
    { field: 'specs', header: 'Cấu Hình (RAM/ROM)', width: '160px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '130px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa model', icon: 'delete', danger: true }
  ];

  readonly models = signal<DeviceModel[]>([
    { id: '1', code: 'A920_PRO', name: 'PAX A920 Pro Smart POS', vendorName: 'PAX Technology', typeName: 'Smart POS Cầm Tay 4G', ramMb: 2048, storageMb: 16384, status: 'ACTIVE', createdAt: '2026-01-12' },
    { id: '2', code: 'A930_TOUCH', name: 'PAX A930 Android 10', vendorName: 'PAX Technology', typeName: 'Smart POS Cầm Tay 4G', ramMb: 2048, storageMb: 16384, status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '3', code: 'DX8000', name: 'Ingenico AXIUM DX8000', vendorName: 'Ingenico', typeName: 'Smart POS Cầm Tay 4G', ramMb: 2048, storageMb: 16384, status: 'ACTIVE', createdAt: '2026-01-20' },
    { id: '4', code: 'V200T', name: 'Verifone VX520 / V200t', vendorName: 'Verifone', typeName: 'POS Để Bàn Cố Định LAN', ramMb: 512, storageMb: 1024, status: 'ACTIVE', createdAt: '2026-02-01' },
    { id: '5', code: 'LANDI_M3', name: 'Landi M3 Soundbox', vendorName: 'Landi', typeName: 'Loa QR Màn Hình Hiển Thị LED', ramMb: 256, storageMb: 512, status: 'INACTIVE', createdAt: '2026-02-15' }
  ]);

  readonly filteredModels = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const ven = this.selectedVendor();
    return this.models().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw);
      const matchVen = !ven || item.vendorName === ven;
      return matchKw && matchVen;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedVendor.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', vendorName: 'PAX Technology', typeName: 'Smart POS Cầm Tay 4G', ramMb: 2048, storageMb: 16384, status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: DeviceModel): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.models.update(list => list.map(m => m.id === this.formModel.id ? { ...m, ...this.formModel } as DeviceModel : m));
      } else {
        const newItem: DeviceModel = {
          ...this.formModel as DeviceModel,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.models.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: DeviceModel, item: DropdownItem): void {
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
      this.models.update(list => list.filter(m => m.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
