import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';
import { InventoryApiService } from '../../../core/services/api/inventory-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface StockItem {
  id: string;
  warehouseName: string;
  posModel: string;
  vendorName: string;
  inStockQty: number;
  assignedQty: number;
  maintenanceQty: number;
  totalQty: number;
}

@Component({
  selector: 'app-stock-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListPageComponent implements OnInit {
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchPosModel = signal('');
  readonly searchVendor = signal('');
  readonly selectedWarehouse = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(4);
  readonly sortField = signal('warehouseName');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns
      .filter(col => col.field !== 'warehouseName')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  readonly warehouseOptions: SelectOption[] = [
    { label: 'Tất cả kho', value: '' },
    { label: 'Kho Tổng POS Hà Nội', value: 'Kho Tổng POS Hà Nội' },
    { label: 'Kho Tổng POS TP.HCM', value: 'Kho Tổng POS TP.HCM' },
    { label: 'Kho Chi Nhánh Đà Nẵng', value: 'Kho Chi Nhánh Đà Nẵng' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'warehouseName', header: 'Tên Kho Hàng', width: '220px', sortable: true },
    { field: 'posModel', header: 'Model Thiết Bị POS', width: '220px', sortable: true },
    { field: 'vendorName', header: 'Nhà Sản Xuất', width: '180px' },
    { field: 'inStockQty', header: 'Tồn Kho Sẵn Sàng', width: '160px', align: 'center' },
    { field: 'assignedQty', header: 'Đã Cấp Merchant', width: '160px', align: 'center' },
    { field: 'maintenanceQty', header: 'Đang Bảo Hành', width: '150px', align: 'center' },
    { field: 'totalQty', header: 'Tổng Thiết Bị', width: '150px', align: 'center' }
  ];

  readonly stockItems = signal<StockItem[]>([
    { id: '1', warehouseName: 'Kho Tổng POS Hà Nội', posModel: 'PAX A920 Pro Smart POS', vendorName: 'PAX Technology Ltd', inStockQty: 450, assignedQty: 1200, maintenanceQty: 15, totalQty: 1665 },
    { id: '2', warehouseName: 'Kho Tổng POS Hà Nội', posModel: 'Ingenico AXIUM DX8000', vendorName: 'Ingenico Group SA', inStockQty: 180, assignedQty: 850, maintenanceQty: 5, totalQty: 1035 },
    { id: '3', warehouseName: 'Kho Tổng POS TP.HCM', posModel: 'PAX A930 Android 10', vendorName: 'PAX Technology Ltd', inStockQty: 620, assignedQty: 1400, maintenanceQty: 22, totalQty: 2042 },
    { id: '4', warehouseName: 'Kho Chi Nhánh Đà Nẵng', posModel: 'Verifone VX520 / V200t', vendorName: 'Verifone Systems Inc', inStockQty: 90, assignedQty: 310, maintenanceQty: 8, totalQty: 408 }
  ]);

  readonly filteredStock = computed(() => {
    const model = this.searchPosModel().toLowerCase().trim();
    const vendor = this.searchVendor().toLowerCase().trim();
    const wh = this.selectedWarehouse();
    return this.stockItems().filter(item => {
      const matchModel = !model || item.posModel.toLowerCase().includes(model);
      const matchVendor = !vendor || item.vendorName.toLowerCase().includes(vendor);
      const matchWh = !wh || item.warehouseName === wh;
      return matchModel && matchVendor && matchWh;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.inventoryApi.getStockSummary({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      posModel: this.searchPosModel(),
      vendor: this.searchVendor(),
      warehouse: this.selectedWarehouse()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.stockItems.set(res.data.content);
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
    this.searchPosModel.set('');
    this.searchVendor.set('');
    this.selectedWarehouse.set('');
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
    this.fileExport.downloadExcel('/inventory/stock/export', 'Bao_Cao_Ton_Kho_POS.xlsx', {
      posModel: this.searchPosModel(),
      warehouse: this.selectedWarehouse()
    });
  }
}
