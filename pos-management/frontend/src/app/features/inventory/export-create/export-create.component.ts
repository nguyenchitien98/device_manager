import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, SelectOption
} from '@shared';

@Component({
  selector: 'app-export-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent, PosBadgeComponent
  ],
  templateUrl: './export-create.component.html',
  styleUrl: './export-create.component.scss'
})
export class ExportCreatePageComponent {
  private readonly router = inject(Router);

  readonly saving = signal(false);

  formModel = {
    exportType: 'MERCHANT',
    sourceWarehouse: 'Kho Tổng POS Hà Nội',
    destinationName: 'WinMart Thăng Long (MID_88880001)',
    note: '',
    serialListText: ''
  };

  readonly typeOptions: SelectOption[] = [
    { label: 'Xuất Cấp Phát Cho Merchant', value: 'MERCHANT' },
    { label: 'Xuất Điều Chuyển Kho', value: 'TRANSFER' },
    { label: 'Xuất Bảo Hành / Sửa Chữa', value: 'MAINTENANCE' }
  ];

  readonly warehouseOptions: SelectOption[] = [
    { label: 'Kho Tổng POS Hà Nội', value: 'Kho Tổng POS Hà Nội' },
    { label: 'Kho Tổng POS TP.HCM', value: 'Kho Tổng POS TP.HCM' }
  ];

  readonly parsedCount = signal(0);

  onSerialListChange(text: string): void {
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    this.parsedCount.set(lines.length);
  }

  onSubmit(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.router.navigate(['/inventory/exports']);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/inventory/exports']);
  }
}
