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
  contactPerson: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListPageComponent {
  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly filterPhone = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Nhà Cung Cấp' : 'Thêm mới Nhà Cung Cấp');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<Vendor | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'ACTIVE'
  };

  readonly allColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'code', header: 'Mã NCC', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Nhà Cung Cấp', width: '220px', sortable: true },
    { field: 'contactPerson', header: 'Người Liên Hệ', width: '180px' },
    { field: 'phone', header: 'Số Điện Thoại', width: '140px' },
    { field: 'email', header: 'Email Liên Hệ', width: '200px' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '130px', align: 'center' }
  ];

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.allColumns.filter(c => !hidden.has(c.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.allColumns
      .filter(col => col.field !== 'actions' && col.field !== 'code')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'bi bi-pencil' },
    { id: 'delete', label: 'Xóa nhà cung cấp', icon: 'bi bi-trash', danger: true }
  ];

  readonly vendors = signal<Vendor[]>([
    { id: '1', code: 'VENDOR_PAX', name: 'PAX Technology Vietnam', contactPerson: 'Nguyễn Văn Hải', phone: '0912345678', email: 'hai.nv@pax.com.vn', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '2', code: 'VENDOR_VERIFONE', name: 'Verifone Vietnam Ltd', contactPerson: 'Trần Thị Mai', phone: '0987654321', email: 'mai.tt@verifone.vn', status: 'ACTIVE', createdAt: '2026-01-12' },
    { id: '3', code: 'VENDOR_INGENICO', name: 'Ingenico Payment Systems', contactPerson: 'Lê Hoàng Long', phone: '0903112233', email: 'long.lh@ingenico.com', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '4', code: 'VENDOR_SUNMI', name: 'Sunmi Technology Corp', contactPerson: 'Phạm Minh Tuấn', phone: '0934556677', email: 'tuan.pm@sunmi.com', status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredVendors = computed(() => {
    const fc = this.filterCode().toLowerCase().trim();
    const fn = this.filterName().toLowerCase().trim();
    const fp = this.filterPhone().trim();
    return this.vendors().filter(item => {
      const matchCode = !fc || item.code.toLowerCase().includes(fc);
      const matchName = !fn || item.name.toLowerCase().includes(fn);
      const matchPhone = !fp || item.phone.includes(fp);
      return matchCode && matchName && matchPhone;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.filterCode.set(''); this.filterName.set(''); this.filterPhone.set(''); this.currentPage.set(1); }
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
    this.formModel = { id: '', code: '', name: '', contactPerson: '', phone: '', email: '', status: 'ACTIVE' };
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
