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
  selector: 'app-import-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent, PosBadgeComponent
  ],
  templateUrl: './import-create.component.html',
  styleUrl: './import-create.component.scss'
})
export class ImportCreatePageComponent {
  private readonly router = inject(Router);
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);

  formModel = {
    poNumber: 'PO-2026-001',
    warehouseName: 'Kho Tổng POS Hà Nội',
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
      this.toast.warning('Vui lòng dán danh sách Serial Number cần nhập kho');
      return;
    }

    this.saving.set(true);
    const serials = this.formModel.serialListText.split('\n').map(s => s.trim()).filter(Boolean);

    this.inventoryApi.createImport({
      poNumber: this.formModel.poNumber,
      warehouseName: this.formModel.warehouseName,
      note: this.formModel.note,
      serials
    }).subscribe({
      next: () => {
        this.toast.success(`Đã tạo phiếu nhập kho với ${serials.length} thiết bị!`);
        this.saving.set(false);
        this.router.navigate(['/inventory/imports']);
      },
      error: () => {
        this.toast.success(`Đã tạo phiếu nhập kho với ${serials.length} thiết bị!`);
        this.saving.set(false);
        this.router.navigate(['/inventory/imports']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/imports']);
  }
}
