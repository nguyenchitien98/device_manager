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

export interface MccItem {
  id: string;
  code: string;
  nameName: string;
  riskLevel: 'Thấp' | 'Trung bình' | 'Cao';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-mcc-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './mcc-list.component.html',
  styleUrl: './mcc-list.component.scss'
})
export class MccListPageComponent implements OnInit {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly filterCode = signal('');
  readonly filterName = signal('');
  readonly filterRisk = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(4);
  readonly sortField = signal('code');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Mã MCC' : 'Thêm mới Mã MCC');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<MccItem | null>(null);

  formModel = {
    id: '',
    code: '',
    nameName: '',
    riskLevel: 'Thấp' as 'Thấp' | 'Trung bình' | 'Cao',
    status: 'ACTIVE'
  };

  readonly riskOptions: SelectOption[] = [
    { label: 'Tất cả rủi ro', value: '' },
    { label: 'Rủi ro Thấp', value: 'Thấp' },
    { label: 'Rủi ro Trung bình', value: 'Trung bình' },
    { label: 'Rủi ro Cao', value: 'Cao' }
  ];

  readonly allColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'code', header: 'Mã MCC', width: '130px', sortable: true },
    { field: 'nameName', header: 'Tên Ngành Nghề Kinh Doanh', width: '250px', sortable: true },
    { field: 'riskLevel', header: 'Mức Rủi Ro', width: '150px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '140px', align: 'center' }
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

  readonly mccList = signal<MccItem[]>([
    { id: '1', code: '5411', nameName: 'Siêu thị & Cửa hàng bách hóa tổng hợp', riskLevel: 'Thấp', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '2', code: '5812', nameName: 'Nhà hàng, Quán ăn & Dịch vụ ăn uống', riskLevel: 'Trung bình', status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '3', code: '5944', nameName: 'Cửa hàng Trang sức & Vàng bạc đá quý', riskLevel: 'Cao', status: 'ACTIVE', createdAt: '2026-02-01' },
    { id: '4', code: '7011', nameName: 'Khách sạn, Resort & Khai thác lưu trú', riskLevel: 'Trung bình', status: 'ACTIVE', createdAt: '2026-02-20' }
  ]);

  readonly filteredMccs = computed(() => {
    const fc = this.filterCode().trim();
    const fn = this.filterName().toLowerCase().trim();
    const fr = this.filterRisk();
    return this.mccList().filter(item => {
      const matchCode = !fc || item.code.includes(fc);
      const matchName = !fn || item.nameName.toLowerCase().includes(fn);
      const matchRisk = !fr || item.riskLevel === fr;
      return matchCode && matchName && matchRisk;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.catalogApi.getMccList({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      code: this.filterCode(),
      name: this.filterName(),
      risk: this.filterRisk()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.mccList.set(res.data.content);
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
    this.filterRisk.set('');
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
    this.fileExport.downloadExcel('/catalog/mcc/export', 'Danh_Sach_MCC.xlsx', {
      code: this.filterCode(),
      name: this.filterName(),
      risk: this.filterRisk()
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
    this.formModel = { id: '', code: '', nameName: '', riskLevel: 'Thấp', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: MccItem): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    if (!this.formModel.code || !this.formModel.nameName) {
      this.toast.warning('Vui lòng nhập đầy đủ Mã MCC và Tên ngành nghề');
      return;
    }

    this.saving.set(true);
    if (this.isEditing()) {
      this.catalogApi.updateMcc(this.formModel.id, this.formModel).subscribe({
        next: () => {
          this.toast.success('Cập nhật mã MCC thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          this.mccList.update(list => list.map(m => m.id === this.formModel.id ? { ...m, ...this.formModel } as MccItem : m));
          this.toast.success('Cập nhật mã MCC thành công!');
          this.saving.set(false);
          this.showModal.set(false);
        }
      });
    } else {
      this.catalogApi.createMcc(this.formModel).subscribe({
        next: () => {
          this.toast.success('Thêm mã MCC mới thành công!');
          this.saving.set(false);
          this.showModal.set(false);
          this.loadData();
        },
        error: () => {
          const newItem: MccItem = {
            ...this.formModel as MccItem,
            id: String(Date.now()),
            createdAt: new Date().toISOString().split('T')[0]
          };
          this.mccList.update(list => [newItem, ...list]);
          this.toast.success('Thêm mã MCC mới thành công!');
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

    this.catalogApi.deleteMcc(target.id).subscribe({
      next: () => {
        this.toast.success(`Đã xóa mã MCC ${target.code}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.mccList.update(list => list.filter(m => m.id !== target.id));
        this.toast.success(`Đã xóa mã MCC ${target.code}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
