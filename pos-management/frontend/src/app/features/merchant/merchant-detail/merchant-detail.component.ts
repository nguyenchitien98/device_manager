import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PosButtonComponent, PosBadgeComponent, PosTableComponent,
  TableColumn
} from '@shared';
import { MerchantApiService } from '../../../core/services/api/merchant-api.service';
import { ToastService } from '../../../core/services/toast.service';

export interface MerchantTerminal {
  tid: string;
  posSerial: string;
  posModel: string;
  feePolicyName: string;
  status: 'ACTIVE' | 'INACTIVE';
  installedDate: string;
}

@Component({
  selector: 'app-merchant-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, PosButtonComponent, PosBadgeComponent, PosTableComponent
  ],
  templateUrl: './merchant-detail.component.html',
  styleUrl: './merchant-detail.component.scss'
})
export class MerchantDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly merchantApi = inject(MerchantApiService);
  private readonly toast = inject(ToastService);

  readonly merchantId = this.route.snapshot.paramMap.get('id') ?? '101';

  readonly merchantDetail = signal({
    id: this.merchantId,
    merchantCode: 'MID_88880001',
    legalName: 'Công Ty TNHH Siêu Thị WinMart',
    brandName: 'WinMart Thăng Long',
    taxCode: '0101234567',
    mccCode: '5411 - Siêu thị & Cửa hàng thực phẩm',
    businessUnitName: 'Chi Nhánh Hà Nội',
    representativeName: 'Nguyễn Văn Nam',
    phone: '0988 123 456',
    email: 'contact@winmart.vn',
    address: 'Số 1 Láng Hạ, Ba Đình, Hà Nội',
    status: 'ACTIVE',
    createdAt: '2026-01-05'
  });

  readonly terminalColumns: TableColumn[] = [
    { field: 'tid', header: 'Mã TID', width: '130px' },
    { field: 'posSerial', header: 'Serial POS Gán', width: '160px' },
    { field: 'posModel', header: 'Model Thiết Bị', width: '200px' },
    { field: 'feePolicyName', header: 'Chính Sách Phí', width: '220px' },
    { field: 'installedDate', header: 'Ngày Lắp Đặt', width: '130px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' }
  ];

  readonly terminals = signal<MerchantTerminal[]>([
    { tid: 'TID_8801', posSerial: 'PAX-A920-998822', posModel: 'PAX A920 Pro Smart POS', feePolicyName: 'Gói Phí Thẻ Napas Mẫu Chuẩn', status: 'ACTIVE', installedDate: '2026-01-10' },
    { tid: 'TID_8802', posSerial: 'PAX-A920-998823', posModel: 'PAX A920 Pro Smart POS', feePolicyName: 'Gói Phí Thẻ Napas Mẫu Chuẩn', status: 'ACTIVE', installedDate: '2026-01-10' },
    { tid: 'TID_8803', posSerial: 'ING-DX8-771199', posModel: 'Ingenico AXIUM DX8000', feePolicyName: 'Gói Phí Thẻ Quốc Tế Visa/Mastercard', status: 'ACTIVE', installedDate: '2026-02-01' }
  ]);

  ngOnInit(): void {
    if (this.merchantId) {
      this.merchantApi.getMerchantById(this.merchantId).subscribe({
        next: (res) => {
          if (res?.data) {
            this.merchantDetail.set(res.data);
          }
        },
        error: () => {}
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/merchant/merchants']);
  }
}
