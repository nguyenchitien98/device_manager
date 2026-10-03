import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PosButtonComponent, PosBadgeComponent, PosTableComponent, TableColumn } from '@shared';
import { DeviceApiService } from '../../../core/services/api/device-api.service';

export interface DeviceHistory {
  eventTime: string;
  eventType: string;
  operatorName: string;
  description: string;
}

@Component({
  selector: 'app-device-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosButtonComponent, PosBadgeComponent, PosTableComponent],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss'
})
export class DeviceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deviceApi = inject(DeviceApiService);

  readonly serialNumber = this.route.snapshot.paramMap.get('id') ?? 'PAX-A920-998822';
  readonly loading = signal(false);

  readonly deviceDetail = signal({
    serialNumber: this.serialNumber,
    posModel: 'PAX A920 Pro Smart POS',
    vendorName: 'PAX Technology Ltd',
    categoryName: 'Smart POS Android',
    warehouseName: 'Kho Tổng POS Hà Nội',
    merchantName: 'WinMart Thăng Long (MID_88880001)',
    tid: 'TID_8801',
    simIccid: '898401123456789 (Viettel 4G)',
    status: 'IN_USE',
    importDate: '2026-01-05',
    assignDate: '2026-01-10'
  });

  readonly historyColumns: TableColumn[] = [
    { field: 'eventTime', header: 'Thời Gian', width: '160px' },
    { field: 'eventType', header: 'Loại Sự Kiện', width: '180px' },
    { field: 'operatorName', header: 'Người Thực Hiện', width: '160px' },
    { field: 'description', header: 'Chi Tiết Nhật Ký Vòng Đời' }
  ];

  readonly historyList = signal<DeviceHistory[]>([
    { eventTime: '2026-01-10 14:30', eventType: 'ASSIGN_TO_MERCHANT', operatorName: 'Nguyễn Văn Hải', description: 'Gán thiết bị và bàn giao cho WinMart Thăng Long (MID_88880001, TID_8801)' },
    { eventTime: '2026-01-05 09:15', eventType: 'IMPORT_WAREHOUSE', operatorName: 'Trần Thị Thu', description: 'Nhập kho thành công vào Kho Tổng POS Hà Nội từ đơn hàng PO-2026-001' }
  ]);

  ngOnInit(): void {
    this.loadDevice();
  }

  loadDevice(): void {
    this.loading.set(true);
    this.deviceApi.getDeviceBySerial(this.serialNumber).subscribe({
      next: (res) => {
        if (res?.data) {
          this.deviceDetail.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.deviceApi.getDeviceLifecycle(this.serialNumber).subscribe({
      next: (res) => {
        if (res?.data) {
          this.historyList.set(res.data);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/device/search']);
  }
}
