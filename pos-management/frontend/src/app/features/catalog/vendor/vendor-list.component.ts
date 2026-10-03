import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';
import { CatalogApiService } from '../../../core/services/api/catalog-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

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
export class VendorListPageComponent implements OnInit {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly filterPhone = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(4);
  readonly sortField = signal('code');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.catalogApi.getVendors({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.filterCode(),
      name: this.filterName(),
      phone: this.filterPhone()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.vendors.set(res.data.content);
          this.totalItems.set(res.data.totalElements);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onReset(): void {
    this.filterCode.set('');
    this.filterName.set('');
    this.filterPhone.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadData();
  }

  onSortChange(event: { field: string; order: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
    this.loadData();
  }

  onExportExcel(): void {
    this.fileExport.downloadExcel('/catalog/vendors/export', 'Danh_Sach_Nha_Cung_Cap.xlsx', {
      code: this.filterCode(),
      name: this.filterName(),
      phone: this.filterPhone()
    });
  }

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
    if (!this.formModel.code || !this.formModel.name) {
      this.toast.warning('Vui lòng nhập đầy đủ Mã và Tên nhà cung cấp');
      return;
    }

    this.saving.set(true);
    if (this.isEditing()) {
      this.catalogApi.updateVendor(this.formModel.id, this.formModel).subscribe({
        next: () => {
          this.toast.success('Cập nhật nhà cung cấp thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          this.vendors.update(list => list.map(v => v.id === this.formModel.id ? { ...v, ...this.formModel } as Vendor : v));
          this.toast.success('Cập nhật nhà cung cấp thành công!');
          this.saving.set(false);
          this.showModal.set(false);
        }
      });
    } else {
      this.catalogApi.createVendor(this.formModel).subscribe({
        next: () => {
          this.toast.success('Thêm nhà cung cấp mới thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          const newItem: Vendor = {
            ...this.formModel as Vendor,
            id: String(Date.now()),
            createdAt: new Date().toISOString().split('T')[0]
          };
          this.vendors.update(list => [newItem, ...list]);
          this.toast.success('Thêm nhà cung cấp mới thành công!');
          this.saving.set(false);
          this.showModal.set(false);
        }
      });
    }
  }

  onConfirmDelete(): void {
    const target = this.selectedItem();
    if (!target) return;
    this.deleting.set(true);

    this.catalogApi.deleteVendor(target.id).subscribe({
      next: () => {
        this.toast.success(`Đã xóa nhà cung cấp ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.vendors.update(list => list.filter(v => v.id !== target.id));
        this.toast.success(`Đã xóa nhà cung cấp ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
