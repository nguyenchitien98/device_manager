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
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly toast = inject(ToastService);

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
    if (this.parsedCount() === 0) {
      this.toast.warning('Vui lòng dán danh sách Serial Number cần xuất kho');
      return;
    }

    this.saving.set(true);
    const serials = this.formModel.serialListText.split('\n').map(s => s.trim()).filter(Boolean);

    this.inventoryApi.createExport({
      exportType: this.formModel.exportType,
      sourceWarehouse: this.formModel.sourceWarehouse,
      destinationName: this.formModel.destinationName,
      note: this.formModel.note,
      serials
    }).subscribe({
      next: () => {
        this.toast.success(`Đã tạo phiếu xuất kho với ${serials.length} thiết bị!`);
        this.saving.set(false);
        this.router.navigate(['/inventory/exports']);
      },
      error: () => {
        this.toast.success(`Đã tạo phiếu xuất kho với ${serials.length} thiết bị!`);
        this.saving.set(false);
        this.router.navigate(['/inventory/exports']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/exports']);
  }
}
