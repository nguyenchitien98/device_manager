import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';

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
export class LogisticsListPageComponent {
  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã giao thành công', value: 'DELIVERED' },
    { label: 'Đang vận chuyển', value: 'IN_TRANSIT' },
    { label: 'Đang đóng gói', value: 'PREPARING' },
    { label: 'Giao thất bại', value: 'FAILED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'trackingNumber', header: 'Mã Vận Đơn', width: '160px', sortable: true },
    { field: 'carrierName', header: 'Đơn Vị Vận Chuyển', width: '180px' },
    { field: 'sourceWarehouse', header: 'Nơi Gửi (Kho Xuất)', width: '200px' },
    { field: 'destinationName', header: 'Nơi Nhận / Merchant', width: '220px' },
    { field: 'totalQuantity', header: 'Số Máy POS', width: '120px', align: 'center' },
    { field: 'estimatedDeliveryDate', header: 'Dự Kiến Giao', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
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
    const kw = this.keyword().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.trackings().filter(item => {
      const matchKw = !kw || item.trackingNumber.toLowerCase().includes(kw) || item.carrierName.toLowerCase().includes(kw) || item.destinationName.toLowerCase().includes(kw);
      const matchSt = !st || item.status === st;
      return matchKw && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedStatus.set(''); this.currentPage.set(1); }

  onActionClick(row: LogisticsTracking, item: DropdownItem): void {
    if (item.id === 'view') {
      alert(`Hành trình vận chuyển mã ${row.trackingNumber} qua đơn vị ${row.carrierName}`);
    }
  }
}
