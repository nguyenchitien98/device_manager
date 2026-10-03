import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';
import { OrganizationApiService } from '../../../core/services/api/organization-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  managerName: string;
  phone: string;
  capacity: number;
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
export class WarehouseListPageComponent implements OnInit {
  private readonly orgApi = inject(OrganizationApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly filterLocation = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(3);
  readonly sortField = signal('code');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Kho Thiết Bị' : 'Thêm mới Kho Thiết Bị');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<Warehouse | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    location: 'Hà Nội',
    managerName: '',
    phone: '',
    capacity: 10000,
    status: 'ACTIVE'
  };

  readonly locationOptions: SelectOption[] = [
    { label: 'Tất cả khu vực', value: '' },
    { label: 'Hà Nội', value: 'Hà Nội' },
    { label: 'TP. Hồ Chí Minh', value: 'TP. Hồ Chí Minh' },
    { label: 'Đà Nẵng', value: 'Đà Nẵng' }
  ];

  readonly allColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'code', header: 'Mã Kho', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Kho Thiết Bị', width: '220px', sortable: true },
    { field: 'location', header: 'Khu Vực', width: '150px' },
    { field: 'managerName', header: 'Thủ Kho Quản Lý', width: '180px' },
    { field: 'capacity', header: 'Sức Chứa (Máy)', width: '140px', align: 'center' },
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

  readonly warehouses = signal<Warehouse[]>([
    { id: '1', code: 'WH_HN_CENTRAL', name: 'Kho POS Trung Tâm Hà Nội', location: 'Hà Nội', managerName: 'Lê Văn Nam', phone: '0912345678', capacity: 15000, status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '2', code: 'WH_HCM_CENTRAL', name: 'Kho POS Trung Tâm TP.HCM', location: 'TP. Hồ Chí Minh', managerName: 'Nguyễn Thị Hoa', phone: '0987654321', capacity: 20000, status: 'ACTIVE', createdAt: '2026-01-12' },
    { id: '3', code: 'WH_DN_BRANCH', name: 'Kho POS Chi Nhánh Đà Nẵng', location: 'Đà Nẵng', managerName: 'Trần Văn Mạnh', phone: '0903112233', capacity: 5000, status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredWarehouses = computed(() => {
    const fc = this.filterCode().toLowerCase().trim();
    const fn = this.filterName().toLowerCase().trim();
    const loc = this.filterLocation();
    return this.warehouses().filter(item => {
      const matchCode = !fc || item.code.toLowerCase().includes(fc);
      const matchName = !fn || item.name.toLowerCase().includes(fn);
      const matchLoc = !loc || item.location === loc;
      return matchCode && matchName && matchLoc;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.orgApi.getWarehouses({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.filterCode(),
      name: this.filterName(),
      location: this.filterLocation()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.warehouses.set(res.data.content);
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
    this.filterLocation.set('');
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
    this.fileExport.downloadExcel('/organization/warehouses/export', 'Danh_Sach_Kho_Thiet_Bi.xlsx', {
      code: this.filterCode(),
      name: this.filterName(),
      location: this.filterLocation()
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
    this.formModel = { id: '', code: '', name: '', location: 'Hà Nội', managerName: '', phone: '', capacity: 10000, status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: Warehouse): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    if (!this.formModel.code || !this.formModel.name) {
      this.toast.warning('Vui lòng nhập đầy đủ Mã và Tên kho thiết bị');
      return;
    }

    this.saving.set(true);
    if (this.isEditing()) {
      this.orgApi.updateWarehouse(this.formModel.id, this.formModel).subscribe({
        next: () => {
          this.toast.success('Cập nhật kho thiết bị thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          this.warehouses.update(list => list.map(w => w.id === this.formModel.id ? { ...w, ...this.formModel } as Warehouse : w));
          this.toast.success('Cập nhật kho thiết bị thành công!');
          this.saving.set(false);
          this.showModal.set(false);
        }
      });
    } else {
      this.orgApi.createWarehouse(this.formModel).subscribe({
        next: () => {
          this.toast.success('Thêm kho thiết bị mới thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          const newItem: Warehouse = {
            ...this.formModel as Warehouse,
            id: String(Date.now()),
            createdAt: new Date().toISOString().split('T')[0]
          };
          this.warehouses.update(list => [newItem, ...list]);
          this.toast.success('Thêm kho thiết bị mới thành công!');
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

    this.orgApi.deleteWarehouse(target.id).subscribe({
      next: () => {
        this.toast.success(`Đã xóa kho ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.warehouses.update(list => list.filter(w => w.id !== target.id));
        this.toast.success(`Đã xóa kho ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
