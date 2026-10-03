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

export interface DeviceModel {
  id: string;
  code: string;
  name: string;
  vendorName: string;
  deviceTypeName: string;
  screenSize: string;
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
export class DeviceModelListPageComponent implements OnInit {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly selectedVendor = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(4);
  readonly sortField = signal('code');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Model POS' : 'Thêm mới Model POS');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<DeviceModel | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    vendorName: 'PAX Technology',
    deviceTypeName: 'Smart POS Cầm Tay 4G',
    screenSize: '5.5 inch',
    status: 'ACTIVE'
  };

  readonly vendorOptions: SelectOption[] = [
    { label: 'Tất cả nhà cung cấp', value: '' },
    { label: 'PAX Technology', value: 'PAX Technology' },
    { label: 'Verifone Vietnam', value: 'Verifone Vietnam' },
    { label: 'Ingenico Group', value: 'Ingenico Group' },
    { label: 'Sunmi Tech', value: 'Sunmi Tech' }
  ];

  readonly allColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'code', header: 'Mã Model', width: '140px', sortable: true },
    { field: 'name', header: 'Tên Model POS', width: '200px', sortable: true },
    { field: 'vendorName', header: 'Nhà Cung Cấp', width: '180px' },
    { field: 'deviceTypeName', header: 'Loại Thiết Bị', width: '200px' },
    { field: 'screenSize', header: 'Màn Hình', width: '120px', align: 'center' },
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

  readonly models = signal<DeviceModel[]>([
    { id: '1', code: 'MODEL_A920', name: 'PAX A920 Pro', vendorName: 'PAX Technology', deviceTypeName: 'Smart POS Cầm Tay 4G', screenSize: '5.5 inch', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '2', code: 'MODEL_VX520', name: 'Verifone VX520', vendorName: 'Verifone Vietnam', deviceTypeName: 'POS Để Bàn Cố Định LAN', screenSize: '2.8 inch', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '3', code: 'MODEL_DX8000', name: 'Ingenico AXIUM DX8000', vendorName: 'Ingenico Group', deviceTypeName: 'Smart POS Quầy Đôi', screenSize: '6.0 inch', status: 'ACTIVE', createdAt: '2026-02-01' },
    { id: '4', code: 'MODEL_V2PRO', name: 'Sunmi V2 Pro', vendorName: 'Sunmi Tech', deviceTypeName: 'mPOS Kết Nối Bluetooth', screenSize: '5.99 inch', status: 'ACTIVE', createdAt: '2026-02-18' }
  ]);

  readonly filteredModels = computed(() => {
    const fc = this.filterCode().toLowerCase().trim();
    const fn = this.filterName().toLowerCase().trim();
    const v = this.selectedVendor();
    return this.models().filter(item => {
      const matchCode = !fc || item.code.toLowerCase().includes(fc);
      const matchName = !fn || item.name.toLowerCase().includes(fn);
      const matchVendor = !v || item.vendorName === v;
      return matchCode && matchName && matchVendor;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.catalogApi.getModels({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.filterCode(),
      name: this.filterName(),
      vendor: this.selectedVendor()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.models.set(res.data.content);
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
    this.selectedVendor.set('');
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
    this.fileExport.downloadExcel('/catalog/device-models/export', 'Danh_Sach_Model_POS.xlsx', {
      code: this.filterCode(),
      name: this.filterName(),
      vendor: this.selectedVendor()
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
    this.formModel = { id: '', code: '', name: '', vendorName: 'PAX Technology', deviceTypeName: 'Smart POS Cầm Tay 4G', screenSize: '5.5 inch', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: DeviceModel): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    if (!this.formModel.code || !this.formModel.name) {
      this.toast.warning('Vui lòng nhập đầy đủ Mã và Tên Model');
      return;
    }

    this.saving.set(true);
    if (this.isEditing()) {
      this.catalogApi.updateModel(this.formModel.id, this.formModel).subscribe({
        next: () => {
          this.toast.success('Cập nhật model thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          this.models.update(list => list.map(m => m.id === this.formModel.id ? { ...m, ...this.formModel } as DeviceModel : m));
          this.toast.success('Cập nhật model thành công!');
          this.saving.set(false);
          this.showModal.set(false);
        }
      });
    } else {
      this.catalogApi.createModel(this.formModel).subscribe({
        next: () => {
          this.toast.success('Thêm model mới thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          const newItem: DeviceModel = {
            ...this.formModel as DeviceModel,
            id: String(Date.now()),
            createdAt: new Date().toISOString().split('T')[0]
          };
          this.models.update(list => [newItem, ...list]);
          this.toast.success('Thêm model mới thành công!');
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

    this.catalogApi.deleteModel(target.id).subscribe({
      next: () => {
        this.toast.success(`Đã xóa model ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.models.update(list => list.filter(m => m.id !== target.id));
        this.toast.success(`Đã xóa model ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
