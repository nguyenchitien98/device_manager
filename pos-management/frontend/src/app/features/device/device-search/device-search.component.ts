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

  readonly searchSerial = signal('');
  readonly searchModel = signal('');
  readonly searchTid = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => col.field !== 'actions' && col.field !== 'serialNumber').map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Tồn kho sẵn sàng (In Stock)', value: 'IN_STOCK' },
    { label: 'Đang hoạt động (In Use)', value: 'IN_USE' },
    { label: 'Đang bảo hành (Maintenance)', value: 'MAINTENANCE' },
    { label: 'Thanh lý (Disposed)', value: 'DISPOSED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '120px', align: 'center' },
    { field: 'serialNumber', header: 'Số Serial POS', width: '170px', sortable: true },
    { field: 'posModel', header: 'Model Thiết Bị', width: '200px', sortable: true },
    { field: 'warehouseName', header: 'Kho Hiện Tại', width: '200px' },
    { field: 'merchantName', header: 'Merchant Gán', width: '220px' },
    { field: 'tid', header: 'Mã TID', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái Vòng Đời', width: '160px', align: 'center' }
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
    const sn = this.searchSerial().toLowerCase().trim();
    const model = this.searchModel().toLowerCase().trim();
    const tid = this.searchTid().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.devices().filter(item => {
      const matchSn = !sn || item.serialNumber.toLowerCase().includes(sn);
      const matchModel = !model || item.posModel.toLowerCase().includes(model);
      const matchTid = !tid || item.tid.toLowerCase().includes(tid) || item.merchantName.toLowerCase().includes(tid);
      const matchSt = !st || item.status === st;
      return matchSn && matchModel && matchTid && matchSt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void {
    this.searchSerial.set('');
    this.searchModel.set('');
    this.searchTid.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
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
    alert('Xuất báo cáo tra cứu thiết bị POS thành công!');
  }

  onActionClick(row: DeviceItem, item: DropdownItem): void {
    if (item.id === 'view') {
      this.router.navigate(['/device/detail', row.serialNumber]);
    }
  }
}
