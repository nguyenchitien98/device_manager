import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent,
  PosInputComponent,
  PosSelectComponent,
  PosBadgeComponent,
  PosTableComponent,
  PosPaginationComponent,
  PosStatusBarComponent,
  StatusCardItem,
  TableColumn
} from '../../../shared';

export interface DeviceLookupItem {
  id: number;
  stt: number;
  serialNumber: string;
  modelName: string;
  typeName: string;
  status: 'IN_STOCK' | 'EXPORTED' | 'IN_USE' | 'RECALLED' | 'INSPECTING' | 'REPAIRING' | 'BROKEN';
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'FAULTY';
  currentLocation: string;
  poCode: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-device-lookup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PosButtonComponent,
    PosInputComponent,
    PosSelectComponent,
    PosBadgeComponent,
    PosTableComponent,
    PosPaginationComponent,
    PosStatusBarComponent
  ],
  templateUrl: './device-lookup.component.html',
  styleUrls: ['./device-lookup.component.scss']
})
export class DeviceLookupComponent implements OnInit {

  // Mode tab: 'serial' vs 'quantity'
  activeMode = signal<'serial' | 'quantity'>('serial');

  // Filter signals
  serialFilter = signal('');
  categoryFilter = signal('');
  deviceTypeFilter = signal('');
  modelFilter = signal('');
  statusFilter = signal('TOTAL');
  warehouseFilter = signal('');
  conditionFilter = signal('');
  poCodeFilter = signal('');

  currentPage = signal(0);
  pageSize = signal(10);
  loading = signal(false);

  // Status Cards Bar (Exact numbers matching user's VPBank photo: Total: 21, InStock: 15, Exported: 6, InUse: 0, Recalled: 0, Inspecting: 0, Repairing: 0, Broken: 0)
  statusCards = signal<StatusCardItem[]>([
    { id: 'TOTAL', label: 'Tổng thiết bị', count: 21, variant: 'slate', icon: 'bi-boxes' },
    { id: 'IN_STOCK', label: 'Trong kho', count: 15, variant: 'emerald', icon: 'bi-inbox-fill' },
    { id: 'EXPORTED', label: 'Đã xuất kho', count: 6, variant: 'blue', icon: 'bi-box-arrow-up-right' },
    { id: 'IN_USE', label: 'Đang sử dụng', count: 0, variant: 'cyan', icon: 'bi-check-circle-fill' },
    { id: 'RECALLED', label: 'Đã thu hồi', count: 0, variant: 'amber', icon: 'bi-arrow-counterclockwise' },
    { id: 'INSPECTING', label: 'Kiểm tra', count: 0, variant: 'violet', icon: 'bi-search-heart' },
    { id: 'REPAIRING', label: 'Đang sửa chữa', count: 0, variant: 'yellow', icon: 'bi-tools' },
    { id: 'BROKEN', label: 'Hư hỏng', count: 0, variant: 'rose', icon: 'bi-exclamation-triangle-fill' }
  ]);

  // Dropdown options
  categoryOptions = [
    { label: 'Thiết Bị POS Quẹt Thẻ', value: 'POS' },
    { label: 'Thiết Bị QR Payment', value: 'QR' },
    { label: 'Phụ Kiện POS', value: 'ACC' }
  ];

  deviceTypeOptions = [
    { label: 'Mobile POS (mPOS)', value: 'MPOS' },
    { label: 'Smart POS Android', value: 'SMART_POS' },
    { label: 'Desktop Counter POS', value: 'DESKTOP' }
  ];

  modelOptions = [
    { label: 'PAX A920 Pro', value: 'PAX_A920_PRO' },
    { label: 'Verifone X990', value: 'VERIFONE_X990' },
    { label: 'Ingenico DX8000', value: 'INGENICO_DX8000' }
  ];

  statusOptions = [
    { label: 'Tất cả trạng thái', value: 'TOTAL' },
    { label: 'Trong kho', value: 'IN_STOCK' },
    { label: 'Đã xuất kho', value: 'EXPORTED' },
    { label: 'Đang sử dụng', value: 'IN_USE' },
    { label: 'Đã thu hồi', value: 'RECALLED' }
  ];

  warehouseOptions = [
    { label: 'KHO LẮNG HẠ (HN)', value: 'WH_LANG_HA' },
    { label: 'KHO TÂN BÌNH (HCM)', value: 'WH_TAN_BINH' },
    { label: 'KHO ĐÀ NẴNG', value: 'WH_DA_NANG' }
  ];

  conditionOptions = [
    { label: 'Tất cả tình trạng', value: '' },
    { label: 'Tốt (100%)', value: 'GOOD' },
    { label: 'Cần bảo trì', value: 'NEEDS_REPAIR' },
    { label: 'Hỏng hóc', value: 'FAULTY' }
  ];

  tableColumns: TableColumn[] = [
    { field: 'actions', header: 'Thao tác', width: '90px', align: 'center' },
    { field: 'stt', header: 'STT', width: '70px', align: 'center' },
    { field: 'serialNumber', header: 'Serial / IMEI', width: '160px' },
    { field: 'modelName', header: 'Model thiết bị', width: '160px' },
    { field: 'typeName', header: 'Loại thiết bị', width: '180px' },
    { field: 'status', header: 'Trạng thái', width: '140px' },
    { field: 'condition', header: 'Tình trạng', width: '120px' },
    { field: 'currentLocation', header: 'Vị trí hiện tại', width: '200px' },
    { field: 'poCode', header: 'Mã Purchase Order', width: '220px' },
    { field: 'lastUpdated', header: 'Cập nhật gần nhất', width: '170px' }
  ];

  // Sample Devices matching VPBank UI Screenshot
  devices = signal<DeviceLookupItem[]>([
    {
      id: 1,
      stt: 1,
      serialNumber: 'MOBILEPOS02',
      modelName: 'PAX A920 Pro',
      typeName: 'Mobile POS (mPOS)',
      status: 'EXPORTED',
      condition: 'GOOD',
      currentLocation: 'ĐƠN VỊ KINH DOANH 2',
      poCode: 'PO_20261001170736130',
      lastUpdated: '05/10/2026 15:27'
    },
    {
      id: 2,
      stt: 2,
      serialNumber: 'MOBILEPOS01',
      modelName: 'PAX A920 Pro',
      typeName: 'Mobile POS (mPOS)',
      status: 'EXPORTED',
      condition: 'GOOD',
      currentLocation: 'ĐƠN VỊ KINH DOANH 2',
      poCode: 'PO_20261001170736130',
      lastUpdated: '05/10/2026 15:27'
    },
    {
      id: 3,
      stt: 3,
      serialNumber: 'PAX3113',
      modelName: 'PAX A920 Pro',
      typeName: 'Mobile POS (mPOS)',
      status: 'IN_STOCK',
      condition: 'GOOD',
      currentLocation: 'KHO LẮNG HẠ',
      poCode: 'PO_20261001170736130',
      lastUpdated: '01/10/2026 17:29'
    },
    {
      id: 4,
      stt: 4,
      serialNumber: 'PAX1112',
      modelName: 'PAX A920 Pro',
      typeName: 'Mobile POS (mPOS)',
      status: 'IN_STOCK',
      condition: 'GOOD',
      currentLocation: 'KHO LẮNG HẠ',
      poCode: 'PO_20261001170736130',
      lastUpdated: '01/10/2026 17:29'
    }
  ]);

  ngOnInit() {}

  onModeChange(mode: 'serial' | 'quantity') {
    this.activeMode.set(mode);
  }

  onStatusCardSelect(statusId: string) {
    this.statusFilter.set(statusId);
  }

  onResetFilter() {
    this.serialFilter.set('');
    this.categoryFilter.set('');
    this.deviceTypeFilter.set('');
    this.modelFilter.set('');
    this.statusFilter.set('TOTAL');
    this.warehouseFilter.set('');
    this.conditionFilter.set('');
    this.poCodeFilter.set('');
  }

  onSearch() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 300);
  }

  getStatusBadgeVariant(status: string): 'success' | 'danger' | 'warning' | 'primary' {
    switch (status) {
      case 'IN_STOCK': return 'success';
      case 'EXPORTED': return 'primary';
      case 'IN_USE': return 'primary';
      case 'RECALLED': return 'warning';
      case 'BROKEN': return 'danger';
      default: return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'IN_STOCK': return 'Đã xuất kho'; // matching image display
      case 'EXPORTED': return 'Đã xuất kho';
      case 'IN_USE': return 'Đang sử dụng';
      case 'RECALLED': return 'Đã thu hồi';
      case 'BROKEN': return 'Hư hỏng';
      default: return status;
    }
  }
}
