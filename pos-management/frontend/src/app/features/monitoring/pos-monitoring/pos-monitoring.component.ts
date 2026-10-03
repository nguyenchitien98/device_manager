import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  TableColumn
} from '@shared';

export interface PosMonitorDevice {
  id: string;
  serialNumber: string;
  model: string;
  merchantName: string;
  tid: string;
  ipAddress: string;
  appVersion: string;
  batteryLevel: number;
  connectionType: '4G' | 'Wifi' | 'LAN';
  lastPing: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
}

@Component({
  selector: 'app-pos-monitoring',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent
  ],
  templateUrl: './pos-monitoring.component.html',
  styleUrl: './pos-monitoring.component.scss'
})
export class PosMonitoringPageComponent {
  readonly keyword = signal('');
  readonly selectedStatus = signal('');
  readonly selectedConnection = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly statusOptions = [
    { label: 'Tất cả trạng thái kết nối', value: '' },
    { label: 'Online (Đang hoạt động)', value: 'ONLINE' },
    { label: 'Offline (Mất kết nối)', value: 'OFFLINE' },
    { label: 'Cảnh báo (Pin yếu / Tải chậm)', value: 'WARNING' }
  ];

  readonly connectionOptions = [
    { label: 'Tất cả mạng kết nối', value: '' },
    { label: 'Mạng 4G/LTE', value: '4G' },
    { label: 'Mạng Wifi', value: 'Wifi' },
    { label: 'Mạng LAN', value: 'LAN' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'serialNumber', header: 'Serial POS', width: '160px', sortable: true },
    { field: 'model', header: 'Model', width: '130px' },
    { field: 'merchantName', header: 'Merchant Sử Dụng', width: '220px' },
    { field: 'tid', header: 'Mã TID', width: '120px', align: 'center' },
    { field: 'ipAddress', header: 'Địa Chỉ IP', width: '140px', align: 'center' },
    { field: 'connectionType', header: 'Kết Nối', width: '100px', align: 'center' },
    { field: 'batteryLevel', header: 'Pin (%)', width: '110px', align: 'center' },
    { field: 'appVersion', header: 'Phiên Bản App', width: '120px', align: 'center' },
    { field: 'lastPing', header: 'Lần Cuối Phản Hồi', width: '150px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' }
  ];

  readonly devices = signal<PosMonitorDevice[]>([
    { id: '1', serialNumber: 'PAX-A920-998822', model: 'PAX A920', merchantName: 'WinMart Thăng Long', tid: 'TID_8801', ipAddress: '192.168.1.105', appVersion: 'v2.4.1', batteryLevel: 95, connectionType: 'Wifi', lastPing: 'Vừa xong (10s)', status: 'ONLINE' },
    { id: '2', serialNumber: 'ING-DX8-771199', model: 'Verifone X990', merchantName: 'Phúc Long Coffee', tid: 'TID_8803', ipAddress: '10.0.4.12', appVersion: 'v2.4.0', batteryLevel: 18, connectionType: '4G', lastPing: '2 phút trước', status: 'WARNING' },
    { id: '3', serialNumber: 'SUN-V2-554411', model: 'Sunmi V2 Pro', merchantName: 'Highlands Coffee Cầu Giấy', tid: 'TID_8809', ipAddress: '172.16.0.45', appVersion: 'v2.3.9', batteryLevel: 0, connectionType: '4G', lastPing: '3 giờ trước', status: 'OFFLINE' }
  ]);

  readonly filteredDevices = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const st = this.selectedStatus();
    const conn = this.selectedConnection();

    return this.devices().filter(item => {
      const matchesKw = !kw || item.serialNumber.toLowerCase().includes(kw) || item.merchantName.toLowerCase().includes(kw) || item.tid.toLowerCase().includes(kw);
      const matchesSt = !st || item.status === st;
      const matchesConn = !conn || item.connectionType === conn;
      return matchesKw && matchesSt && matchesConn;
    });
  });

  readonly onlineCount = computed(() => this.devices().filter(d => d.status === 'ONLINE').length);
  readonly offlineCount = computed(() => this.devices().filter(d => d.status === 'OFFLINE').length);
  readonly warningCount = computed(() => this.devices().filter(d => d.status === 'WARNING').length);

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedStatus.set(''); this.selectedConnection.set(''); this.currentPage.set(1); }
}
