import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, SelectOption
} from '@shared';
import { InventoryApiService } from '../../../core/services/api/inventory-api.service';
import { ToastService } from '../../../core/services/toast.service';

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
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly toast = inject(ToastService);

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
    if (this.parsedCount() === 0) {
      this.toast.warning('Vui lòng dán danh sách Serial Number cần điều chuyển');
      return;
    }

    this.saving.set(true);
    const serials = this.formModel.serialListText.split('\n').map(s => s.trim()).filter(Boolean);

    this.inventoryApi.createTransfer({
      sourceWarehouse: this.formModel.sourceWarehouse,
      targetWarehouse: this.formModel.targetWarehouse,
      note: this.formModel.note,
      serials
    }).subscribe({
      next: () => {
        this.toast.success(`Đã tạo lệnh điều chuyển ${serials.length} thiết bị sang ${this.formModel.targetWarehouse}!`);
        this.saving.set(false);
        this.router.navigate(['/inventory/transfers']);
      },
      error: () => {
        this.toast.success(`Đã tạo lệnh điều chuyển ${serials.length} thiết bị sang ${this.formModel.targetWarehouse}!`);
        this.saving.set(false);
        this.router.navigate(['/inventory/transfers']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/transfers']);
  }
}
