import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosDropdownComponent, TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface DeviceItem {
  id: string;
  serialNumber: string;
  posModel: string;
  warehouseName: string;
  merchantName: string;
  tid: string;
  status: 'IN_STOCK' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED';
  simIccid: string;
}

@Component({
  selector: 'app-device-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent, PosDropdownComponent
  ],
  templateUrl: './device-search.component.html',
  styleUrl: './device-search.component.scss'
})
export class DeviceSearchPageComponent {
  private readonly router = inject(Router);

  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Tồn kho sẵn sàng (In Stock)', value: 'IN_STOCK' },
    { label: 'Đang hoạt động (In Use)', value: 'IN_USE' },
    { label: 'Đang bảo hành (Maintenance)', value: 'MAINTENANCE' },
    { label: 'Thanh lý (Disposed)', value: 'DISPOSED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'serialNumber', header: 'Số Serial POS', width: '170px', sortable: true },
    { field: 'posModel', header: 'Model Thiết Bị', width: '200px', sortable: true },
    { field: 'warehouseName', header: 'Kho Hiện Tại', width: '200px' },
    { field: 'merchantName', header: 'Merchant Gán', width: '220px' },
    { field: 'tid', header: 'Mã TID', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái Vòng Đời', width: '160px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Tra cứu chi tiết Serial', icon: 'visibility' }
  ];

  readonly devices = signal<DeviceItem[]>([
    { id: '1', serialNumber: 'PAX-A920-998822', posModel: 'PAX A920 Pro Smart POS', warehouseName: 'Kho Tổng POS Hà Nội', merchantName: 'WinMart Thăng Long', tid: 'TID_8801', status: 'IN_USE', simIccid: '898401123456789' },
    { id: '2', serialNumber: 'PAX-A920-998823', posModel: 'PAX A920 Pro Smart POS', warehouseName: 'Kho Tổng POS Hà Nội', merchantName: 'WinMart Thăng Long', tid: 'TID_8802', status: 'IN_USE', simIccid: '898401123456790' },
    { id: '3', serialNumber: 'PAX-A920-990001', posModel: 'PAX A920 Pro Smart POS', warehouseName: 'Kho Tổng POS Hà Nội', merchantName: '—', tid: '—', status: 'IN_STOCK', simIccid: '898401123456791' },
    { id: '4', serialNumber: 'ING-DX8-771199', posModel: 'Ingenico AXIUM DX8000', warehouseName: 'Kho Tổng POS TP.HCM', merchantName: 'Phúc Long Coffee & Tea', tid: 'TID_8803', status: 'IN_USE', simIccid: '898401123456792' },
    { id: '5', serialNumber: 'VER-V200-112233', posModel: 'Verifone VX520 / V200t', warehouseName: 'Kho Chi Nhánh Đà Nẵng', merchantName: '—', tid: '—', status: 'MAINTENANCE', simIccid: '—' }
  ]);

  readonly filteredDevices = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.devices().filter(item => {
      const matchKw = !kw || item.serialNumber.toLowerCase().includes(kw) || item.posModel.toLowerCase().includes(kw) || item.merchantName.toLowerCase().includes(kw) || item.tid.toLowerCase().includes(kw);
      const matchSt = !st || item.status === st;
      return matchKw && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedStatus.set(''); this.currentPage.set(1); }

  onActionClick(row: DeviceItem, item: DropdownItem): void {
    if (item.id === 'view') {
      this.router.navigate(['/device/detail', row.serialNumber]);
    }
  }
}
