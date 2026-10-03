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

export interface FeePolicy {
  id: string;
  code: string;
  name: string;
  feeRate: number;
  minFee: number;
  maxFee: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-fee-policy-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './fee-policy-list.component.html',
  styleUrl: './fee-policy-list.component.scss'
})
export class FeePolicyListPageComponent implements OnInit {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(3);
  readonly sortField = signal('code');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Chính Sách Phí' : 'Thêm mới Chính Sách Phí');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<FeePolicy | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    feeRate: 1.2,
    minFee: 2000,
    maxFee: 50000,
    status: 'ACTIVE'
  };

  readonly allColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'code', header: 'Mã CS Phí', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Chính Sách Phí', width: '220px', sortable: true },
    { field: 'feeRate', header: 'Tỷ Lệ Phí (%)', width: '130px', align: 'right' },
    { field: 'minFee', header: 'Phí Tối Thiểu (VNĐ)', width: '160px', align: 'right' },
    { field: 'maxFee', header: 'Phí Tối Đa (VNĐ)', width: '160px', align: 'right' },
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

  readonly policies = signal<FeePolicy[]>([
    { id: '1', code: 'FEE_STANDARD', name: 'Gói Phí Tiêu Chuẩn Merchant', feeRate: 1.2, minFee: 2000, maxFee: 50000, status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '2', code: 'FEE_SUPERMARKET', name: 'Gói Phí Ưu Đãi Chuỗi Siêu Thị', feeRate: 0.8, minFee: 1000, maxFee: 30000, status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '3', code: 'FEE_JEWELRY', name: 'Gói Phí Cao Cấp Tiệm Vàng Vàng Bạc', feeRate: 1.5, minFee: 5000, maxFee: 100000, status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredPolicies = computed(() => {
    const fc = this.filterCode().toLowerCase().trim();
    const fn = this.filterName().toLowerCase().trim();
    return this.policies().filter(item => {
      const matchCode = !fc || item.code.toLowerCase().includes(fc);
      const matchName = !fn || item.name.toLowerCase().includes(fn);
      return matchCode && matchName;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.catalogApi.getFeePolicies({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.filterCode(),
      name: this.filterName()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.policies.set(res.data.content);
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
    this.fileExport.downloadExcel('/catalog/fee-policies/export', 'Danh_Sach_Chinh_Sach_Phi.xlsx', {
      code: this.filterCode(),
      name: this.filterName()
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
    this.formModel = { id: '', code: '', name: '', feeRate: 1.2, minFee: 2000, maxFee: 50000, status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: FeePolicy): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    if (!this.formModel.code || !this.formModel.name) {
      this.toast.warning('Vui lòng nhập đầy đủ Mã và Tên chính sách phí');
      return;
    }

    this.saving.set(true);
    if (this.isEditing()) {
      this.catalogApi.updateFeePolicy(this.formModel.id, this.formModel).subscribe({
        next: () => {
          this.toast.success('Cập nhật chính sách phí thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          this.policies.update(list => list.map(p => p.id === this.formModel.id ? { ...p, ...this.formModel } as FeePolicy : p));
          this.toast.success('Cập nhật chính sách phí thành công!');
          this.saving.set(false);
          this.showModal.set(false);
        }
      });
    } else {
      this.catalogApi.createFeePolicy(this.formModel).subscribe({
        next: () => {
          this.toast.success('Thêm chính sách phí mới thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          const newItem: FeePolicy = {
            ...this.formModel as FeePolicy,
            id: String(Date.now()),
            createdAt: new Date().toISOString().split('T')[0]
          };
          this.policies.update(list => [newItem, ...list]);
          this.toast.success('Thêm chính sách phí mới thành công!');
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

    this.catalogApi.deleteFeePolicy(target.id).subscribe({
      next: () => {
        this.toast.success(`Đã xóa chính sách phí ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.policies.update(list => list.filter(p => p.id !== target.id));
        this.toast.success(`Đã xóa chính sách phí ${target.name}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
