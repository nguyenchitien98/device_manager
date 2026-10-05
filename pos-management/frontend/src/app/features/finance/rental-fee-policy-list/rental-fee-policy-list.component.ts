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
import { RentalFeeService } from '../../../core/services/rental-fee.service';
import { RentalFeePolicy, MonthlyFeeCharge } from '../../../core/models/rental-fee.model';

@Component({
  selector: 'app-rental-fee-policy-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PosButtonComponent,
    PosInputComponent,
    PosBadgeComponent,
    PosTableComponent,
    PosPaginationComponent,
    PosModalComponent
  ],
  templateUrl: './rental-fee-policy-list.component.html',
  styleUrls: ['./rental-fee-policy-list.component.scss']
})
export class RentalFeePolicyListComponent implements OnInit {
  protected service = inject(RentalFeeService);

  activeTab = signal<'charges' | 'policies'>('charges');
  periodFilter = signal('');
  currentPage = signal(0);
  pageSize = signal(10);

  // Policy Modal
  isCreateModalOpen = signal(false);
  newPolicyCode = signal('');
  newPolicyName = signal('');
  newPolicyMinVolume = signal(50000000);
  newPolicyRentalFee = signal(300000);
  newPolicyPenaltyFee = signal(150000);

  chargeColumns: TableColumn[] = [
    { field: 'period', header: 'Kỳ Tính Phí', width: '120px' },
    { field: 'merchantId', header: 'ID Merchant', width: '140px' },
    { field: 'terminalId', header: 'TID POS', width: '140px' },
    { field: 'actualVolume', header: 'Doanh Số Quẹt Thẻ (VND)', width: '200px' },
    { field: 'feeAmount', header: 'Phí Thuê / Phạt (VND)', width: '180px' },
    { field: 'status', header: 'Trạng Thái', width: '150px' },
    { field: 't24ReferenceNo', header: 'Mã Bút Toán Core T24', width: '200px' },
    { field: 'actions', header: 'Thao Tác', width: '180px', align: 'center' }
  ];

  policyColumns: TableColumn[] = [
    { field: 'code', header: 'Mã Chính Sách', width: '160px' },
    { field: 'name', header: 'Tên Chính Sách Phí', width: '250px' },
    { field: 'minMonthlyVolume', header: 'Doanh Số Tối Thiểu (VND)', width: '200px' },
    { field: 'monthlyRentalFee', header: 'Phí Thuê Hàng Tháng (VND)', width: '200px' },
    { field: 'penaltyFee', header: 'Phí Phạt Thiếu Doanh Số (VND)', width: '220px' },
    { field: 'isActive', header: 'Trạng Thái', width: '140px' }
  ];

  ngOnInit() {
    this.loadCharges();
    this.service.getPolicies().subscribe();
  }

  loadCharges() {
    this.service.getCharges(this.periodFilter(), this.currentPage(), this.pageSize()).subscribe();
  }

  onTabChange(tab: 'charges' | 'policies') {
    this.activeTab.set(tab);
  }

  onPeriodChange(val: string) {
    this.periodFilter.set(val);
    this.currentPage.set(0);
    this.loadCharges();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCharges();
  }

  onCalculatePeriod() {
    this.service.calculatePeriod(this.periodFilter()).subscribe({
      next: () => this.loadCharges()
    });
  }

  onChargeFee(charge: MonthlyFeeCharge) {
    this.service.chargeFee(charge.id).subscribe({
      next: () => this.loadCharges()
    });
  }

  onWaiveFee(charge: MonthlyFeeCharge) {
    this.service.waiveFee(charge.id).subscribe({
      next: () => this.loadCharges()
    });
  }

  openCreatePolicyModal() {
    this.isCreateModalOpen.set(true);
  }

  closeCreatePolicyModal() {
    this.isCreateModalOpen.set(false);
  }

  savePolicy() {
    const req = {
      code: this.newPolicyCode(),
      name: this.newPolicyName(),
      minMonthlyVolume: this.newPolicyMinVolume(),
      monthlyRentalFee: this.newPolicyRentalFee(),
      penaltyFee: this.newPolicyPenaltyFee(),
      isActive: true
    };
    this.service.createPolicy(req).subscribe({
      next: () => {
        this.closeCreatePolicyModal();
        this.service.getPolicies().subscribe();
      }
    });
  }

  getBadgeVariant(status: string): 'success' | 'danger' | 'warning' | 'primary' {
    switch (status) {
      case 'CHARGED': return 'success';
      case 'WAIVED': return 'primary';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'danger';
      default: return 'primary';
    }
  }

  getBadgeLabel(status: string): string {
    switch (status) {
      case 'CHARGED': return 'Đã Trích Nợ T24';
      case 'WAIVED': return 'Miễn Phí (Đạt KPI)';
      case 'PENDING': return 'Chờ Trích Nợ';
      case 'FAILED': return 'Lỗi Trích Nợ';
      default: return status;
    }
  }
}
