import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface DeviceCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  deviceCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-device-category-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './device-category-list.component.html',
  styleUrl: './device-category-list.component.scss'
})
export class DeviceCategoryListPageComponent {
  // Signals
  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  // Modal Signals
  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Danh Mục Thiết Bị' : 'Thêm mới Danh Mục Thiết Bị');
  readonly saving = signal(false);

  // Confirm Delete
  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<DeviceCategory | null>(null);

  // Form Model
  formModel = {
    id: '',
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE'
  };

  // Status Filter Options
  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Hoạt động', value: 'ACTIVE' },
    { label: 'Ngừng hoạt động', value: 'INACTIVE' }
  ];

  // Table Columns
  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã Danh Mục', width: '140px', sortable: true },
    { field: 'name', header: 'Tên Danh Mục', width: '220px', sortable: true },
    { field: 'description', header: 'Mô Tả' },
    { field: 'deviceCount', header: 'Số Lượng POS', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '140px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  // Row Action Items
  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa danh mục', icon: 'delete', danger: true }
  ];

  // Mock Data
  readonly categories = signal<DeviceCategory[]>([
    { id: '1', code: 'POS_ANDROID', name: 'Smart POS Android', description: 'Máy POS màn hình cảm ứng Android cao cấp tích hợp in hóa đơn', deviceCount: 1420, status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '2', code: 'POS_TRADITIONAL', name: 'POS Truyền Thống', description: 'Máy POS quẹt thẻ vật lý chuẩn Verifone / Ingenico', deviceCount: 3850, status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '3', code: 'MPOS_MOBILE', name: 'mPOS Di Động', description: 'Thiết bị quẹt thẻ di động kết nối qua Bluetooth smartphone', deviceCount: 920, status: 'ACTIVE', createdAt: '2026-02-01' },
    { id: '4', code: 'QR_SOUNDBOX', name: 'Soundbox Loa QR', description: 'Loa thông báo thanh toán QR tức thì tích hợp màn hình LED', deviceCount: 2150, status: 'ACTIVE', createdAt: '2026-02-18' },
    { id: '5', code: 'SOFT_POS', name: 'SoftPOS App', description: 'Giải pháp biến điện thoại Android thành máy quẹt thẻ Tap to Phone', deviceCount: 410, status: 'INACTIVE', createdAt: '2026-03-05' }
  ]);

  // Filtered List
  readonly filteredCategories = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.categories().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw);
      const matchSt = !st || item.status === st;
      return matchKw && matchSt;
    });
  });

  onSearch(): void {
    this.currentPage.set(1);
  }

  onReset(): void {
    this.keyword.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', description: '', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: DeviceCategory): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.categories.update(list => list.map(c => c.id === this.formModel.id ? { ...c, ...this.formModel } as DeviceCategory : c));
      } else {
        const newItem: DeviceCategory = {
          ...this.formModel,
          id: String(Date.now()),
          code: this.formModel.code || '',
          name: this.formModel.name || '',
          description: this.formModel.description || '',
          status: (this.formModel.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
          deviceCount: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.categories.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: DeviceCategory, item: DropdownItem): void {
    if (item.id === 'edit') {
      this.openEditModal(row);
    } else if (item.id === 'delete') {
      this.selectedItem.set(row);
      this.showDeleteConfirm.set(true);
    }
  }

  onConfirmDelete(): void {
    const target = this.selectedItem();
    if (!target) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.categories.update(list => list.filter(c => c.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
