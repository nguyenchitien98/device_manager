import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, TableColumn
} from '@shared';

export interface InventoryReportRow {
  warehouseName: string;
  deviceType: string;
  model: string;
  totalImported: number;
  inStockNew: number;
  inStockUsed: number;
  allocatedActive: number;
  underRepair: number;
  disposed: number;
}

@Component({
  selector: 'app-report-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent
  ],
  templateUrl: './report-inventory.component.html',
  styleUrl: './report-inventory.component.scss'
})
export class ReportInventoryPageComponent {
  readonly selectedWarehouse = signal('');
  readonly selectedType = signal('');
  readonly loading = signal(false);

  readonly warehouseOptions = [
    { label: 'Tất cả kho thiết bị', value: '' },
    { label: 'Kho POS Trung Tâm Hà Nội', value: 'HN' },
    { label: 'Kho POS Trung Tâm TP.HCM', value: 'HCM' },
    { label: 'Kho POS Chi Nhánh Đà Nẵng', value: 'DN' }
  ];

  readonly typeOptions = [
    { label: 'Tất cả loại máy POS', value: '' },
    { label: 'Smart POS Android', value: 'SMART' },
    { label: 'Traditional POS', value: 'TRAD' },
    { label: 'mPOS Bluetooth', value: 'MPOS' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'warehouseName', header: 'Kho Quản Lý', width: '200px' },
    { field: 'deviceType', header: 'Loại Thiết Bị', width: '160px' },
    { field: 'model', header: 'Model POS', width: '140px' },
    { field: 'totalImported', header: 'Tổng Nhập', width: '110px', align: 'right' },
    { field: 'inStockNew', header: 'Kho Mới 100%', width: '120px', align: 'right' },
    { field: 'inStockUsed', header: 'Kho Tái Sử Dụng', width: '130px', align: 'right' },
    { field: 'allocatedActive', header: 'Đã Bàn Giao', width: '120px', align: 'right' },
    { field: 'underRepair', header: 'Bảo Hành / Lỗi', width: '130px', align: 'right' },
    { field: 'disposed', header: 'Đã Hủy / Thanh Lý', width: '140px', align: 'right' }
  ];

  readonly reportRows = signal<InventoryReportRow[]>([
    { warehouseName: 'Kho POS Trung Tâm Hà Nội', deviceType: 'Smart POS Android', model: 'PAX A920', totalImported: 500, inStockNew: 120, inStockUsed: 30, allocatedActive: 320, underRepair: 20, disposed: 10 },
    { warehouseName: 'Kho POS Trung Tâm Hà Nội', deviceType: 'Traditional POS', model: 'Verifone VX520', totalImported: 300, inStockNew: 40, inStockUsed: 10, allocatedActive: 230, underRepair: 15, disposed: 5 },
    { warehouseName: 'Kho POS Trung Tâm TP.HCM', deviceType: 'Smart POS Android', model: 'Ingenico DX8000', totalImported: 450, inStockNew: 90, inStockUsed: 25, allocatedActive: 310, underRepair: 18, disposed: 7 }
  ]);

  readonly filteredReport = computed(() => {
    const wh = this.selectedWarehouse();
    const tp = this.selectedType();

    return this.reportRows().filter(item => {
      const matchesWh = !wh || item.warehouseName.includes(wh);
      const matchesTp = !tp || item.deviceType.includes(tp);
      return matchesWh && matchesTp;
    });
  });

  onExportExcel(): void {
    // Export Excel action simulation
  }

  onExportPdf(): void {
    // Export PDF action simulation
  }
}
