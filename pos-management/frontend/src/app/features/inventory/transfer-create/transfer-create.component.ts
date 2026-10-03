import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, SelectOption
} from '@shared';

@Component({
  selector: 'app-transfer-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent, PosBadgeComponent
  ],
  templateUrl: './transfer-create.component.html',
  styleUrl: './transfer-create.component.scss'
})
export class TransferCreatePageComponent {
  private readonly router = inject(Router);

  readonly saving = signal(false);

  formModel = {
    sourceWarehouse: 'Kho Tổng POS Hà Nội',
    targetWarehouse: 'Kho Chi Nhánh Đà Nẵng',
    note: '',
    serialListText: ''
  };

  readonly warehouseOptions: SelectOption[] = [
    { label: 'Kho Tổng POS Hà Nội', value: 'Kho Tổng POS Hà Nội' },
    { label: 'Kho Tổng POS TP.HCM', value: 'Kho Tổng POS TP.HCM' },
    { label: 'Kho Chi Nhánh Đà Nẵng', value: 'Kho Chi Nhánh Đà Nẵng' }
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
      this.router.navigate(['/inventory/transfers']);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/inventory/transfers']);
  }
}
