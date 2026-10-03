import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosModalComponent, PosTableComponent,
  PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent,
  TableColumn, SelectOption, DropdownItem
} from '@shared';

export interface MccItem {
  id: string;
  code: string;
  name: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Component({
  selector: 'app-mcc-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosModalComponent, PosTableComponent,
    PosPaginationComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './mcc-list.component.html',
  styleUrl: './mcc-list.component.scss'
})
export class MccListPageComponent {
  readonly keyword = signal('');
  readonly selectedRisk = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly showModal = signal(false);
  readonly isEditing = signal(false);
  readonly modalTitle = computed(() => this.isEditing() ? 'Chỉnh sửa Mã MCC' : 'Thêm mới Mã MCC');
  readonly saving = signal(false);

  readonly showDeleteConfirm = signal(false);
  readonly deleting = signal(false);
  readonly selectedItem = signal<MccItem | null>(null);

  formModel = {
    id: '',
    code: '',
    name: '',
    riskLevel: 'LOW',
    status: 'ACTIVE'
  };

  readonly riskOptions: SelectOption[] = [
    { label: 'Tất cả rủi ro', value: '' },
    { label: 'Rủi ro thấp (Low)', value: 'LOW' },
    { label: 'Rủi ro trung bình (Medium)', value: 'MEDIUM' },
    { label: 'Rủi ro cao (High)', value: 'HIGH' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'code', header: 'Mã MCC', width: '130px', sortable: true },
    { field: 'name', header: 'Tên Ngành Hàng (MCC Description)', width: '320px', sortable: true },
    { field: 'riskLevel', header: 'Mức Rủi Ro', width: '150px', align: 'center' },
    { field: 'status', header: 'Trạng Thái', width: '140px', align: 'center' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '140px', align: 'center' },
    { field: 'actions', header: 'Thao Tác', width: '100px', align: 'center' }
  ];

  readonly actionItems: DropdownItem[] = [
    { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
    { id: 'delete', label: 'Xóa MCC', icon: 'delete', danger: true }
  ];

  readonly mccList = signal<MccItem[]>([
    { id: '1', code: '5411', name: 'Siêu thị & Cửa hàng thực phẩm (Supermarkets)', riskLevel: 'LOW', status: 'ACTIVE', createdAt: '2026-01-01' },
    { id: '2', code: '5812', name: 'Nhà hàng & Quán ăn (Restaurants & Dining)', riskLevel: 'LOW', status: 'ACTIVE', createdAt: '2026-01-01' },
    { id: '3', code: '5541', name: 'Trạm xăng dầu (Service Stations)', riskLevel: 'MEDIUM', status: 'ACTIVE', createdAt: '2026-01-05' },
    { id: '4', code: '7995', name: 'Cá cược & Trò chơi có thưởng (Gambling / Betting)', riskLevel: 'HIGH', status: 'ACTIVE', createdAt: '2026-01-10' },
    { id: '5', code: '5094', name: 'Trang sức, Vàng bạc & Đá quý (Precious Stones & Jewelry)', riskLevel: 'HIGH', status: 'ACTIVE', createdAt: '2026-01-15' }
  ]);

  readonly filteredMcc = computed(() => {
    const kw = this.keyword().toLowerCase().trim();
    const rk = this.selectedRisk();
    return this.mccList().filter(item => {
      const matchKw = !kw || item.code.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw);
      const matchRk = !rk || item.riskLevel === rk;
      return matchKw && matchRk;
    });
  });

  onSearch(): void { this.currentPage.set(1); }
  onReset(): void { this.keyword.set(''); this.selectedRisk.set(''); this.currentPage.set(1); }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.formModel = { id: '', code: '', name: '', riskLevel: 'LOW', status: 'ACTIVE' };
    this.showModal.set(true);
  }

  openEditModal(item: MccItem): void {
    this.isEditing.set(true);
    this.formModel = { ...item };
    this.showModal.set(true);
  }

  onSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      if (this.isEditing()) {
        this.mccList.update(list => list.map(m => m.id === this.formModel.id ? { ...m, ...this.formModel } as MccItem : m));
      } else {
        const newItem: MccItem = {
          ...this.formModel as MccItem,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.mccList.update(list => [newItem, ...list]);
      }
      this.saving.set(false);
      this.showModal.set(false);
    }, 400);
  }

  onActionClick(row: MccItem, item: DropdownItem): void {
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
      this.mccList.update(list => list.filter(m => m.id !== target.id));
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
    }, 400);
  }
}
