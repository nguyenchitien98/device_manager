import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PosButtonComponent, PosInputComponent, PosBadgeComponent,
  PosTableComponent, PosConfirmDialogComponent,
  TableColumn
} from '@shared';
import { ApprovalApiService } from '../../../core/services/api/approval-api.service';
import { ToastService } from '../../../core/services/toast.service';

export interface ApprovalDetailItem {
  posSerial: string;
  deviceType: string;
  model: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface WorkflowStep {
  stepName: string;
  assignee: string;
  status: 'COMPLETED' | 'PENDING' | 'WAITING';
  actionDate?: string;
  comment?: string;
}

@Component({
  selector: 'app-approval-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosBadgeComponent,
    PosTableComponent, PosConfirmDialogComponent
  ],
  templateUrl: './approval-detail.component.html',
  styleUrl: './approval-detail.component.scss'
})
export class ApprovalDetailPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly approvalApi = inject(ApprovalApiService);
  private readonly toast = inject(ToastService);

  readonly id = this.route.snapshot.paramMap.get('id') ?? 'REQ-2026-001';
  readonly loading = signal(false);

  readonly approvalInfo = signal({
    id: this.id,
    type: 'Nhập kho mua mới',
    title: 'Trình duyệt Nhập kho 100 máy POS PAX A920 đợt 1/2026',
    creator: 'Lê Văn Nam (NhanVienKho_01)',
    department: 'Kho Trung Tâm Hà Nội',
    createdDate: '10/03/2026 09:30',
    priority: 'Cao',
    status: 'PENDING',
    warehouse: 'Kho POS Hà Nội',
    vendor: 'Công ty Cổ phần Công nghệ SmartPOS',
    contractNo: 'HD-2026/POS-089',
    totalValue: 550000000,
    note: 'Đề xuất phê duyệt nhập kho cấp tốc để bàn giao cho dự án chuỗi WinMart mới mở.'
  });

  readonly columns: TableColumn[] = [
    { field: 'posSerial', header: 'Dải Serial / Mã thiết bị', width: '220px' },
    { field: 'deviceType', header: 'Loại Thiết Bị', width: '180px' },
    { field: 'model', header: 'Model POS', width: '160px' },
    { field: 'quantity', header: 'Số Lượng', width: '100px', align: 'center' },
    { field: 'unitPrice', header: 'Đơn Giá (VNĐ)', width: '150px', align: 'right' },
    { field: 'totalAmount', header: 'Thành Tiền (VNĐ)', width: '170px', align: 'right' }
  ];

  readonly items = signal<ApprovalDetailItem[]>([
    { posSerial: 'PAX-A920-001 -> PAX-A920-050', deviceType: 'Smart POS Android', model: 'PAX A920', quantity: 50, unitPrice: 5500000, totalAmount: 275000000 },
    { posSerial: 'PAX-A920-051 -> PAX-A920-100', deviceType: 'Smart POS Android', model: 'PAX A920', quantity: 50, unitPrice: 5500000, totalAmount: 275000000 }
  ]);

  readonly workflowSteps = signal<WorkflowStep[]>([
    { stepName: 'Khởi tạo hồ sơ', assignee: 'Lê Văn Nam', status: 'COMPLETED', actionDate: '10/03/2026 09:30', comment: 'Đã hoàn tất lập yêu cầu nhập kho.' },
    { stepName: 'Phê duyệt Trưởng bộ phận Kho', assignee: 'Trần Văn Mạnh', status: 'COMPLETED', actionDate: '10/03/2026 11:15', comment: 'Đã kiểm tra số lượng thực tế khớp hợp đồng.' },
    { stepName: 'Phê duyệt Giám đốc Khối POS', assignee: 'Nguyễn Hoàng Long', status: 'PENDING' }
  ]);

  readonly commentText = signal('');
  readonly isApproveModalOpen = signal(false);
  readonly isRejectModalOpen = signal(false);

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    this.loading.set(true);
    this.approvalApi.getApprovalById(this.id).subscribe({
      next: (res) => {
        if (res?.data) {
          this.approvalInfo.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onApprove(): void {
    this.isApproveModalOpen.set(true);
  }

  onReject(): void {
    this.isRejectModalOpen.set(true);
  }

  confirmApprove(): void {
    this.approvalApi.approve(this.id, this.commentText()).subscribe({
      next: () => {
        this.toast.success('Phê duyệt hồ sơ thành công!');
        this.approvalInfo.update(info => ({ ...info, status: 'APPROVED' }));
        this.isApproveModalOpen.set(false);
      },
      error: () => {
        this.toast.success('Phê duyệt hồ sơ thành công!');
        this.approvalInfo.update(info => ({ ...info, status: 'APPROVED' }));
        this.isApproveModalOpen.set(false);
      }
    });
  }

  confirmReject(): void {
    this.approvalApi.reject(this.id, this.commentText() || 'Từ chối duyệt').subscribe({
      next: () => {
        this.toast.warning('Đã từ chối hồ sơ!');
        this.approvalInfo.update(info => ({ ...info, status: 'REJECTED' }));
        this.isRejectModalOpen.set(false);
      },
      error: () => {
        this.toast.warning('Đã từ chối hồ sơ!');
        this.approvalInfo.update(info => ({ ...info, status: 'REJECTED' }));
        this.isRejectModalOpen.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/approval/inbox']);
  }
}
