import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PosButtonComponent, PosBadgeComponent } from '@shared';
import { MerchantApiService } from '../../../core/services/api/merchant-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-terminal-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosButtonComponent, PosBadgeComponent],
  templateUrl: './terminal-detail.component.html',
  styleUrl: './terminal-detail.component.scss'
})
export class TerminalDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly merchantApi = inject(MerchantApiService);
  private readonly toast = inject(ToastService);

  readonly tidId = this.route.snapshot.paramMap.get('id') ?? '1';

  readonly terminalDetail = signal({
    id: this.tidId,
    tid: 'TID_8801',
    merchantCode: 'MID_88880001',
    merchantName: 'WinMart Thăng Long',
    assignedSerial: 'PAX-A920-998822',
    posModel: 'PAX A920 Pro Smart POS',
    vendorName: 'PAX Technology Ltd',
    simNumber: '0988776655 (Viettel 4G)',
    feePolicyName: 'Gói Phí Thẻ Napas Mẫu Chuẩn',
    status: 'ACTIVE',
    createdAt: '2026-01-10'
  });

  ngOnInit(): void {
    if (this.tidId) {
      this.merchantApi.getTerminalById(this.tidId).subscribe({
        next: (res) => {
          if (res?.data) {
            this.terminalDetail.set(res.data);
          }
        },
        error: () => {}
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/merchant/terminals']);
  }
}
