import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';
import { MerchantApiService } from '../../../core/services/api/merchant-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface TerminalItem {
  id: string;
  tid: string;
  merchantCode: string;
  merchantName: string;
  assignedSerial: string;
  posModel: string;
  status: 'ACTIVE' | 'UNASSIGNED' | 'LOCKED';
  createdAt: string;
}

@Component({
  selector: 'app-terminal-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './terminal-list.component.html',
  styleUrl: './terminal-list.component.scss'
})
export class TerminalListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly merchantApi = inject(MerchantApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchTid = signal('');
  readonly searchMerchantCode = signal('');
  readonly searchSerial = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(4);
  readonly sortField = signal('tid');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly showModal = signal(false);
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<TerminalItem | null>(null);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns
      .filter(col => col.field !== 'actions' && col.field !== 'tid')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  formModel = {
    tid: '',
    merchantCode: 'MID_88880001',
    merchantName: 'WinMart Thăng Long',
    assignedSerial: 'PAX-A920-998824',
    posModel: 'PAX A920 Pro Smart POS'
  };

  readonly statusOptions: SelectOption[] = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã gán & Hoạt động', value: 'ACTIVE' },
    { label: 'Chưa gán máy POS', value: 'UNASSIGNED' },
    { label: 'Tạm khóa TID', value: 'LOCKED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '200px', align: 'center' },
    { field: 'tid', header: 'Mã TID', width: '130px', sortable: true },
    { field: 'merchantCode', header: 'Mã MID', width: '140px', sortable: true },
    { field: 'merchantName', header: 'Tên Merchant / Cửa Hàng', width: '220px' },
    { field: 'assignedSerial', header: 'Serial POS Gán', width: '170px' },
    { field: 'posModel', header: 'Model Thiết Bị', width: '200px' },
    { field: 'status', header: 'Trạng Thái', width: '150px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'view', label: 'Xem chi tiết TID', icon: 'visibility' },
    { id: 'lock', label: 'Tạm khóa TID', icon: 'lock', danger: true }
  ];

  readonly terminals = signal<TerminalItem[]>([
    { id: '1', tid: 'TID_8801', merchantCode: 'MID_88880001', merchantName: 'WinMart Thăng Long', assignedSerial: 'PAX-A920-998822', posModel: 'PAX A920 Pro Smart POS', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '2', tid: 'TID_8802', merchantCode: 'MID_88880001', merchantName: 'WinMart Thăng Long', assignedSerial: 'PAX-A920-998823', posModel: 'PAX A920 Pro Smart POS', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '3', tid: 'TID_8803', merchantCode: 'MID_88880002', merchantName: 'Phúc Long Coffee & Tea', assignedSerial: 'ING-DX8-771199', posModel: 'Ingenico AXIUM DX8000', status: 'ACTIVE', createdAt: '2026-02-01' },
    { id: '4', tid: 'TID_8804', merchantCode: 'MID_88880003', merchantName: 'Circle K Hoàn Kiếm', assignedSerial: 'Chưa gán', posModel: '—', status: 'UNASSIGNED', createdAt: '2026-02-15' }
  ]);

  readonly filteredTerminals = computed(() => {
    const tid = this.searchTid().toLowerCase().trim();
    const mid = this.searchMerchantCode().toLowerCase().trim();
    const serial = this.searchSerial().toLowerCase().trim();
    const st = this.selectedStatus();
    return this.terminals().filter(item => {
      const matchTid = !tid || item.tid.toLowerCase().includes(tid);
      const matchMid = !mid || item.merchantCode.toLowerCase().includes(mid) || item.merchantName.toLowerCase().includes(mid);
      const matchSerial = !serial || item.assignedSerial.toLowerCase().includes(serial);
      const matchSt = !st || item.status === st;
      return matchTid && matchMid && matchSerial && matchSt;
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.merchantApi.getTerminals({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      tid: this.searchTid(),
      merchantCode: this.searchMerchantCode(),
      serial: this.searchSerial(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.terminals.set(res.data.content);
          this.totalItems.set(res.data.totalElements);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onReset(): void {
    this.searchTid.set('');
    this.searchMerchantCode.set('');
    this.searchSerial.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadData();
  }

  onSortChange(event: { field: string; order: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
    this.loadData();
  }

  onColumnToggle(item: DropdownItem): void {
    this.hiddenColumns.update(set => {
      const next = new Set(set);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  exportExcel(): void {
    this.fileExport.downloadExcel('/terminals/export', 'Danh_Sach_Terminal_TID.xlsx', {
      tid: this.searchTid(),
      merchantCode: this.searchMerchantCode(),
      status: this.selectedStatus()
    });
  }

  openCreateModal(): void {
    this.formModel = {
      tid: 'TID_880' + (this.terminals().length + 1),
      merchantCode: 'MID_88880001',
      merchantName: 'WinMart Thăng Long',
      assignedSerial: 'PAX-A920-998824',
      posModel: 'PAX A920 Pro Smart POS'
    };
    this.showModal.set(true);
  }

  onSave(): void {
    if (!this.formModel.tid) {
      this.toast.warning('Vui lòng nhập mã TID');
      return;
    }

    this.saving.set(true);
    this.merchantApi.createTerminal(this.formModel).subscribe({
      next: () => {
        this.toast.success('Cấp mã TID mới thành công!');
        this.saving.set(false);
        this.showModal.set(false);
        this.loadData();
      },
      error: () => {
        const newItem: TerminalItem = {
          id: String(Date.now()),
          tid: this.formModel.tid,
          merchantCode: this.formModel.merchantCode,
          merchantName: this.formModel.merchantName,
          assignedSerial: this.formModel.assignedSerial,
          posModel: this.formModel.posModel,
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.terminals.update(list => [newItem, ...list]);
        this.toast.success('Cấp mã TID mới thành công!');
        this.saving.set(false);
        this.showModal.set(false);
      }
    });
  }

  onViewTerminal(row: TerminalItem): void {
    this.router.navigate(['/merchant/terminal-detail', row.id]);
  }

  openEditModal(row: TerminalItem): void {
    this.formModel = {
      tid: row.tid,
      merchantCode: row.merchantCode,
      merchantName: row.merchantName,
      assignedSerial: row.assignedSerial,
      posModel: row.posModel
    };
    this.showModal.set(true);
  }

  onActionClick(row: TerminalItem, item: DropdownItem): void {
    if (item.id === 'view') {
      this.onViewTerminal(row);
    } else if (item.id === 'lock') {
      this.selectedItem.set(row);
      this.showDeleteConfirm.set(true);
    }
  }

  onConfirmLock(): void {
    const target = this.selectedItem();
    if (!target) return;
    this.deleting.set(true);

    this.merchantApi.updateTerminalStatus(target.id, 'LOCKED').subscribe({
      next: () => {
        this.toast.success(`Đã khóa mã TID ${target.tid}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
        this.loadData();
      },
      error: () => {
        this.terminals.update(list => list.map(t => t.id === target.id ? { ...t, status: 'LOCKED' } : t));
        this.toast.success(`Đã khóa mã TID ${target.tid}`);
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }
}
