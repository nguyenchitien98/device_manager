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

export interface LogisticsTracking {
  id: string;
  trackingNumber: string;
  carrierName: string;
  sourceWarehouse: string;
  destinationName: string;
  totalQuantity: number;
  status: 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  estimatedDeliveryDate: string;
}

@Component({
  selector: 'app-logistics-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './logistics-list.component.html',
  styleUrl: './logistics-list.component.scss'
})
export class LogisticsListPageComponent implements OnInit {
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchTrackingNumber = signal('');
  readonly searchCarrier = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(3);
  readonly sortField = signal('trackingNumber');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns
      .filter(col => col.field !== 'actions' && col.field !== 'trackingNumber')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã giao thành công', value: 'DELIVERED' },
    { label: 'Đang vận chuyển', value: 'IN_TRANSIT' },
    { label: 'Đang đóng gói', value: 'PREPARING' },
    { label: 'Giao thất bại', value: 'FAILED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'trackingNumber', header: 'Mã Vận Đơn', width: '160px', sortable: true },
    { field: 'carrierName', header: 'Đơn Vị Vận Chuyển', width: '180px' },
    { field: 'sourceWarehouse', header: 'Nơi Gửi (Kho Xuất)', width: '200px' },
    { field: 'destinationName', header: 'Nơi Nhận / Merchant', width: '220px' },
    { field: 'totalQuantity', header: 'Số Máy POS', width: '120px', align: 'center' },
    { field: 'estimatedDeliveryDate', header: 'Dự Kiến Giao', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem hành trình vận chuyển', icon: 'local_shipping' }
  ];

  readonly trackings = signal<LogisticsTracking[]>([
    { id: '1', trackingNumber: 'VTP-8899112233', carrierName: 'Viettel Post', sourceWarehouse: 'Kho Tổng POS Hà Nội', destinationName: 'WinMart Thăng Long (MID_88880001)', totalQuantity: 12, status: 'DELIVERED', estimatedDeliveryDate: '2026-01-12' },
    { id: '2', trackingNumber: 'GHTK-7711223344', carrierName: 'Giao Hàng Tiết Kiệm', sourceWarehouse: 'Kho Tổng POS TP.HCM', destinationName: 'Phúc Long Coffee & Tea', totalQuantity: 8, status: 'IN_TRANSIT', estimatedDeliveryDate: '2026-03-05' },
    { id: '3', trackingNumber: 'INTERNAL-LOG-001', carrierName: 'Đội Giao Nhận Nội Bộ Ngân Hàng', sourceWarehouse: 'Kho Tổng POS Hà Nội', destinationName: 'Kho Chi Nhánh Đà Nẵng', totalQuantity: 100, status: 'PREPARING', estimatedDeliveryDate: '2026-03-10' }
  ]);

  readonly filteredTrackings = computed(() => {
    const tracking = this.searchTrackingNumber().toLowerCase().trim();
    const carrier = this.searchCarrier().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.trackings().filter(item => {
      const matchTracking = !tracking || item.trackingNumber.toLowerCase().includes(tracking);
      const matchCarrier = !carrier || item.carrierName.toLowerCase().includes(carrier) || item.destinationName.toLowerCase().includes(carrier);
      const matchSt = !st || item.status === st;
      return matchTracking && matchCarrier && matchSt;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.inventoryApi.getLogisticsList({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      trackingNumber: this.searchTrackingNumber(),
      carrier: this.searchCarrier(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.trackings.set(res.data.content);
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
    this.searchTrackingNumber.set('');
    this.searchCarrier.set('');
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
    this.fileExport.downloadExcel('/logistics/shipments/export', 'Danh_Sach_Van_Don_Logistics.xlsx', {
      trackingNumber: this.searchTrackingNumber(),
      status: this.selectedStatus()
    });
  }

  onActionClick(row: LogisticsTracking, item: DropdownItem): void {
    if (item.id === 'view') {
      this.toast.info(`Vận đơn ${row.trackingNumber} (${row.carrierName}): Dự kiến giao ${row.estimatedDeliveryDate}`);
    }
  }
}
