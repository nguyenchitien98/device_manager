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
  PosModalComponent,
  TableColumn
} from '../../../shared';
import { TelecomService } from '../../../core/services/telecom.service';
import { SimCard, CreateSimCardRequest } from '../../../core/models/telecom.model';

@Component({
  selector: 'app-sim-list',
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
    PosModalComponent
  ],
  templateUrl: './sim-list.component.html',
  styleUrls: ['./sim-list.component.scss']
})
export class SimListComponent implements OnInit {
  protected telecomService = inject(TelecomService);

  searchQuery = signal('');
  selectedTelco = signal('');
  selectedStatus = signal('');
  currentPage = signal(0);
  pageSize = signal(10);
  isCreateModalOpen = signal(false);

  // Form State
  newSimSerial = signal('');
  newPhoneNumber = signal('');
  newTelco = signal('VIETTEL');
  newMonthlyFee = signal(50000);
  newNotes = signal('');

  telcoOptions = [
    { label: 'Tất cả nhà mạng', value: '' },
    { label: 'Viettel', value: 'VIETTEL' },
    { label: 'Vinaphone', value: 'VINAPHONE' },
    { label: 'Mobifone', value: 'MOBIFONE' }
  ];

  statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Trong kho (INSTOCK)', value: 'INSTOCK' },
    { label: 'Đang gán (ASSIGNED)', value: 'ASSIGNED' },
    { label: 'Tạm khóa (SUSPENDED)', value: 'SUSPENDED' },
    { label: 'Hết hạn (EXPIRED)', value: 'EXPIRED' }
  ];

  columns: TableColumn[] = [
    { field: 'simSerial', header: 'Seri SIM', width: '180px' },
    { field: 'phoneNumber', header: 'Số Điện Thoại', width: '150px' },
    { field: 'telco', header: 'Nhà Mạng', width: '120px' },
    { field: 'packageName', header: 'Gói Cước', width: '140px' },
    { field: 'monthlyFee', header: 'Phí Tháng (VNĐ)', width: '150px' },
    { field: 'status', header: 'Trạng Thái', width: '140px' },
    { field: 'createdAt', header: 'Ngày Nhập Kho', width: '160px' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.telecomService.getSimCards(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.selectedTelco(),
      this.selectedStatus()
    ).subscribe();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  saveSimCard() {
    if (!this.newSimSerial() || !this.newPhoneNumber()) return;

    const req: CreateSimCardRequest = {
      simSerial: this.newSimSerial(),
      phoneNumber: this.newPhoneNumber(),
      telco: this.newTelco(),
      monthlyFee: this.newMonthlyFee(),
      notes: this.newNotes()
    };

    this.telecomService.createSimCard(req).subscribe({
      next: () => {
        this.isCreateModalOpen.set(false);
        this.resetForm();
        this.loadData();
      }
    });
  }

  private resetForm() {
    this.newSimSerial.set('');
    this.newPhoneNumber.set('');
    this.newTelco.set('VIETTEL');
    this.newMonthlyFee.set(50000);
    this.newNotes.set('');
  }
}
