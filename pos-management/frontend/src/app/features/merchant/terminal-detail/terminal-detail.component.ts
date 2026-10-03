import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PosButtonComponent, PosBadgeComponent } from '@shared';

@Component({
  selector: 'app-terminal-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosButtonComponent, PosBadgeComponent],
  templateUrl: './terminal-detail.component.html',
  styleUrl: './terminal-detail.component.scss'
})
export class TerminalDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  goBack(): void {
    this.router.navigate(['/merchant/terminals']);
  }
}
