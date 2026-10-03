import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  TableColumn, SelectOption
} from '@shared';

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
    PosBadgeComponent, PosTableComponent, PosPaginationComponent
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListPageComponent {
  readonly keyword = signal('');
  readonly selectedWarehouse = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

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
    const kw = this.keyword().toLowerCase().trim();
    const wh = this.selectedWarehouse();
    return this.stockItems().filter(item => {
      const matchKw = !kw || item.posModel.toLowerCase().includes(kw) || item.vendorName.toLowerCase().includes(kw);
      const matchWh = !wh || item.warehouseName === wh;
      return matchKw && matchWh;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedWarehouse.set(''); this.currentPage.set(1); }
}
