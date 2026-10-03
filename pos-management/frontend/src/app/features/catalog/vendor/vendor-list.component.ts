import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface Vendor {
  id: string;
  code: string;
  name: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListPageComponent {
  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Vendor' : 'Thêm mới Vendor');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<Vendor | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    country: 'Trung Quốc',
    contactEmail: '',
    contactPhone: '',
    status: 'ACTIVE'
  };

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Hoạt động', value: 'ACTIVE' },
    { label: 'Ngừng hoạt động', value: 'INACTIVE' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã Vendor', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Nhà Sản Xuất', width: '220px', sortable: true },
    { field: 'country', header: 'Quốc Gia', width: '140px' },
    { field: 'contactEmail', header: 'Email Liên Hệ' },
    { field: 'contactPhone', header: 'Số Điện Thoại', width: '140px' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '130px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa vendor', icon: 'delete', danger: true }
  ];

  readonly vendors = signal<Vendor[]>([
    { id: '1', code: 'VENDOR_PAX', name: 'PAX Technology Ltd', country: 'Trung Quốc', contactEmail: 'support@pax.com.cn', contactPhone: '+86 755 86169630', status: 'ACTIVE', createdAt: '2026-01-05' },
    { id: '2', code: 'VENDOR_INGENICO', name: 'Ingenico Group SA', country: 'Pháp', contactEmail: 'contact@ingenico.com', contactPhone: '+33 1 58018000', status: 'ACTIVE', createdAt: '2026-01-08' },
    { id: '3', code: 'VENDOR_VERIFONE', name: 'Verifone Systems Inc', country: 'Mỹ', contactEmail: 'info@verifone.com', contactPhone: '+1 408 2327800', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '4', code: 'VENDOR_LANDI', name: 'Fujian Landi Commercial Equipment', country: 'Trung Quốc', contactEmail: 'service@landicorp.com', contactPhone: '+86 591 87880000', status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredVendors = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.vendors().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw);
      const matchSt = !st || item.status === st;
      return matchKw && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedStatus.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', country: 'Trung Quốc', contactEmail: '', contactPhone: '', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: Vendor): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.vendors.update(list => list.map(v => v.id === this.formModel.id ? { ...v, ...this.formModel } as Vendor : v));
      } else {
        const newItem: Vendor = {
          ...this.formModel as Vendor,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.vendors.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: Vendor, item: DropdownItem): void {
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
      this.vendors.update(list => list.filter(v => v.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
