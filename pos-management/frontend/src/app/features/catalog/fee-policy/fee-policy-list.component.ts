import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface FeePolicy {
  id: string;
  code: string;
  name: string;
  cardType: 'DOMESTIC' | 'INTERNATIONAL';
  merchantRatePercent: number;
  minFeeAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-fee-policy-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './fee-policy-list.component.html',
  styleUrl: './fee-policy-list.component.scss'
})
export class FeePolicyListPageComponent {
  readonly keyword = signal('');
  readonly selectedCardType = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Chính Sách Phí' : 'Thêm mới Chính Sách Phí');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<FeePolicy | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    cardType: 'DOMESTIC',
    merchantRatePercent: 0.8,
    minFeeAmount: 5000,
    status: 'ACTIVE'
  };

  readonly cardTypeOptions: SelectOption[] = [
    { label: 'Tất cả loại thẻ', value: '' },
    { label: 'Thẻ Nội Địa (Napas)', value: 'DOMESTIC' },
    { label: 'Thẻ Quốc Tế (Visa/Master/JCB)', value: 'INTERNATIONAL' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã Chính Sách', width: '140px', sortable: true },
    { field: 'name', header: 'Tên Chính Sách Phí', width: '240px', sortable: true },
    { field: 'cardType', header: 'Loại Thẻ Áp Dụng', width: '180px', align: 'center' },
    { field: 'merchantRatePercent', header: 'Phí Phần Trăm (%)', width: '150px', align: 'center' },
    { field: 'minFeeAmount', header: 'Phí Tối Thiểu (VND)', width: '160px', align: 'right' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa chính sách', icon: 'delete', danger: true }
  ];

  readonly policies = signal<FeePolicy[]>([
    { id: '1', code: 'FEE_NAPAS_STANDARD', name: 'Gói Phí Thẻ Napas Mẫu Chuẩn', cardType: 'DOMESTIC', merchantRatePercent: 0.5, minFeeAmount: 2000, status: 'ACTIVE', createdAt: '2026-01-01' },
    { id: '2', code: 'FEE_INTL_VISA_MASTER', name: 'Gói Phí Thẻ Quốc Tế Visa/Mastercard', cardType: 'INTERNATIONAL', merchantRatePercent: 1.8, minFeeAmount: 10000, status: 'ACTIVE', createdAt: '2026-01-01' },
    { id: '3', code: 'FEE_SUPERMARKET_PREFER', name: 'Gói Phí Ưu Đãi Siêu Thị', cardType: 'DOMESTIC', merchantRatePercent: 0.3, minFeeAmount: 1000, status: 'ACTIVE', createdAt: '2026-01-15' },
    { id: '4', code: 'FEE_LUXURY_JEWELRY', name: 'Gói Phí Cao Cấp Vàng Bạc Đá Quý', cardType: 'INTERNATIONAL', merchantRatePercent: 2.2, minFeeAmount: 20000, status: 'ACTIVE', createdAt: '2026-02-01' }
  ]);

  readonly filteredPolicies = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const ct = this.selectedCardType();
    return this.policies().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw);
      const matchCt = !ct || item.cardType === ct;
      return matchKw && matchCt;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedCardType.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', cardType: 'DOMESTIC', merchantRatePercent: 0.8, minFeeAmount: 5000, status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: FeePolicy): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.policies.update(list => list.map(p => p.id === this.formModel.id ? { ...p, ...this.formModel } as FeePolicy : p));
      } else {
        const newItem: FeePolicy = {
          ...this.formModel as FeePolicy,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.policies.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: FeePolicy, item: DropdownItem): void {
    if (item.id === 'edit') this.openEditModal(row);
    else if (item.id === 'delete') {
      this.selectedItem.set(row);
      this.showDeleteConfirm.set(true);
    }
  }

  onConfirmDelete(): void {
    const target = this.selectedItem();
    if (!target) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.policies.update(list => list.filter(p => p.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
