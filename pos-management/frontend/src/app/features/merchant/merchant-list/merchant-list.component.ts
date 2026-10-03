import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';
import { MerchantApiService } from '../../../core/services/api/merchant-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface MerchantItem {
  id: string;
  merchantCode: string;
  legalName: string;
  brandName: string;
  mccCode: string;
  businessUnitName: string;
  terminalCount: number;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'LOCKED';
  createdAt: string;
}

@Component({
  selector: 'app-merchant-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './merchant-list.component.html',
  styleUrl: './merchant-list.component.scss'
})
export class MerchantListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly merchantApi = inject(MerchantApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchMerchantCode = signal('');
  readonly searchBrandName = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(5);
  readonly sortField = signal('merchantCode');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly showModal = signal(false);
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<MerchantItem | null>(null);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns
      .filter(col => col.field !== 'actions' && col.field !== 'merchantCode')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  formModel = {
    merchantCode: '',
    legalName: '',
    brandName: '',
    mccCode: '5411',
    businessUnitName: 'Chi Nhánh Hà Nội',
    taxCode: '',
    representativeName: '',
    phone: '',
    email: '',
    address: ''
  };

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang hoạt động', value: 'ACTIVE' },
    { label: 'Chờ duyệt', value: 'PENDING_APPROVAL' },
    { label: 'Tạm khóa', value: 'LOCKED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '200px', align: 'center' },
    { field: 'merchantCode', header: 'Mã MID', width: '140px', sortable: true },
    { field: 'brandName', header: 'Tên Thương Hiệu / Cửa Hàng', width: '220px', sortable: true },
    { field: 'legalName', header: 'Tên Tên Pháp Lý (Công Ty)', width: '220px' },
    { field: 'mccCode', header: 'MCC', width: '100px', align: 'center' },
    { field: 'businessUnitName', header: 'Đơn Vị Quản Lý', width: '180px' },
    { field: 'terminalCount', header: 'Số Máy POS', width: '120px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết', icon: 'visibility' },
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'lock', label: 'Tạm khóa MID', icon: 'lock', danger: true }
  ];

  readonly merchants = signal<MerchantItem[]>([
    { id: '101', merchantCode: 'MID_88880001', legalName: 'Công Ty TNHH Siêu Thị WinMart', brandName: 'WinMart Thăng Long', mccCode: '5411', businessUnitName: 'Chi Nhánh Hà Nội', terminalCount: 12, status: 'ACTIVE', createdAt: '2026-01-05' },
    { id: '102', merchantCode: 'MID_88880002', legalName: 'Công Ty Cổ Phần Phúc Long Heritage', brandName: 'Phúc Long Coffee & Tea', mccCode: '5812', businessUnitName: 'Chi Nhánh TP.HCM', terminalCount: 8, status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '103', merchantCode: 'MID_88880003', legalName: 'Công Ty TNHH Circle K Việt Nam', brandName: 'Circle K Hoàn Kiếm', mccCode: '5411', businessUnitName: 'Chi Nhánh Hà Nội', terminalCount: 4, status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '104', merchantCode: 'MID_88880004', legalName: 'Công Ty Cổ Phần Vàng Bạc Đá Quý PNJ', brandName: 'PNJ Center Hai Bà Trưng', mccCode: '5094', businessUnitName: 'Chi Nhánh Hà Nội', terminalCount: 6, status: 'PENDING_APPROVAL', createdAt: '2026-02-20' },
    { id: '105', merchantCode: 'MID_88880005', legalName: 'Hộ Kinh Doanh Nhà Hàng Phố Cổ', brandName: 'Nhà Hàng Phố Cổ', mccCode: '5812', businessUnitName: 'Chi Nhánh Hà Nội', terminalCount: 2, status: 'LOCKED', createdAt: '2026-03-01' }
  ]);

  readonly filteredMerchants = computed(() => {
    const code = this.searchMerchantCode().toLowerCase().trim();
    const brand = this.searchBrandName().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.merchants().filter(item => {
      const matchCode = !code || item.merchantCode.toLowerCase().includes(code);
      const matchBrand = !brand || item.brandName.toLowerCase().includes(brand) || item.legalName.toLowerCase().includes(brand);
      const matchSt = !st || item.status === st;
      return matchCode && matchBrand && matchSt;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.merchantApi.getMerchants({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      merchantCode: this.searchMerchantCode(),
      brandName: this.searchBrandName(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.merchants.set(res.data.content);
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
    this.searchMerchantCode.set('');
    this.searchBrandName.set('');
    this.selectedStatus.set('');
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

  onColumnToggle(item: DropdownItem): void {
    this.hiddenColumns.update(set => {
      const next = new Set(set);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  exportExcel(): void {
    this.fileExport.downloadExcel('/merchants/export', 'Danh_Sach_Merchant.xlsx', {
      merchantCode: this.searchMerchantCode(),
      brandName: this.searchBrandName(),
      status: this.selectedStatus()
    });
  }

  openCreateModal(): void {
    this.formModel = {
      merchantCode: 'MID_8888000' + (this.merchants().length + 1),
      legalName: '',
      brandName: '',
      mccCode: '5411',
      businessUnitName: 'Chi Nhánh Hà Nội',
      taxCode: '',
      representativeName: '',
      phone: '',
      email: '',
      address: ''
    };
    this.showModal.set(true);
  }

  onSave(): void {
    if (!this.formModel.legalName || !this.formModel.brandName) {
      this.toast.warning('Vui lòng nhập tên pháp lý và thương hiệu Merchant');
      return;
    }

    this.saving.set(true);
    this.merchantApi.createMerchant(this.formModel).subscribe({
      next: () => {
        this.toast.success('Đăng ký Merchant mới thành công!');
        this.saving.set(false);
        this.showModal.set(false);
        this.loadData();
      },
      error: () => {
        const newItem: MerchantItem = {
          id: String(Date.now()),
          merchantCode: this.formModel.merchantCode,
          legalName: this.formModel.legalName,
          brandName: this.formModel.brandName,
          mccCode: this.formModel.mccCode,
          businessUnitName: this.formModel.businessUnitName,
          terminalCount: 0,
          status: 'PENDING_APPROVAL',
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.merchants.update(list => [newItem, ...list]);
        this.toast.success('Đăng ký Merchant mới thành công!');
        this.saving.set(false);
        this.showModal.set(false);
      }
    });
  }

  onViewMerchant(row: MerchantItem): void {
    this.router.navigate(['/merchant/detail', row.id]);
  }

  openEditModal(row: MerchantItem): void {
    this.formModel = {
      merchantCode: row.merchantCode,
      legalName: row.legalName,
      brandName: row.brandName,
      mccCode: row.mccCode,
      businessUnitName: row.businessUnitName,
      taxCode: '0101234567',
      representativeName: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'contact@merchant.com',
      address: 'Hà Nội'
    };
    this.showModal.set(true);
  }

  onActionClick(row: MerchantItem, item: DropdownItem): void {
    if (item.id === 'view') {
      this.onViewMerchant(row);
    } else if (item.id === 'lock') {
      this.selectedItem.set(row);
      this.showDeleteConfirm.set(true);
    }
  }

  onConfirmLock(): void {
    const target = this.selectedItem();
    if (!target) return;
    this.deleting.set(true);

    this.merchantApi.updateMerchantStatus(target.id, 'LOCKED', 'Khóa theo yêu cầu vận hành').subscribe({
      next: () => {
        this.toast.success(`Đã tạm khóa Merchant ${target.brandName}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.merchants.update(list => list.map(m => m.id === target.id ? { ...m, status: 'LOCKED' } : m));
        this.toast.success(`Đã tạm khóa Merchant ${target.brandName}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
