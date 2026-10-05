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
import { TicketService } from '../../../core/services/ticket.service';
import { MaintenanceTicket, CreateTicketRequest } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-list',
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
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit {
  protected ticketService = inject(TicketService);

  selectedStatus = signal('');
  selectedPriority = signal('');
  currentPage = signal(0);
  pageSize = signal(10);
  isCreateModalOpen = signal(false);

  // Form State
  newIssueType = signal('HARDWARE');
  newPriority = signal('MEDIUM');
  newDescription = signal('');

  statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Mới mở (OPEN)', value: 'OPEN' },
    { label: 'Đã phân công (ASSIGNED)', value: 'ASSIGNED' },
    { label: 'Đang xử lý (IN_PROGRESS)', value: 'IN_PROGRESS' },
    { label: 'Đã xử lý (RESOLVED)', value: 'RESOLVED' }
  ];

  issueTypeOptions = [
    { label: 'Sự cố Phần cứng (HARDWARE)', value: 'HARDWARE' },
    { label: 'Sự cố Phần mềm (SOFTWARE)', value: 'SOFTWARE' },
    { label: 'Hết giấy in (PAPER)', value: 'PAPER' },
    { label: 'Lỗi SIM / Cước (SIM)', value: 'SIM' },
    { label: 'Đổi máy POS (REPLACEMENT)', value: 'REPLACEMENT' }
  ];

  priorityOptions = [
    { label: 'Thấp (LOW)', value: 'LOW' },
    { label: 'Trung bình (MEDIUM)', value: 'MEDIUM' },
    { label: 'Cao (HIGH)', value: 'HIGH' },
    { label: 'Khẩn cấp (URGENT)', value: 'URGENT' }
  ];

  columns: TableColumn[] = [
    { field: 'ticketNumber', header: 'Mã Ticket', width: '160px' },
    { field: 'issueType', header: 'Loại Sự Cố', width: '160px' },
    { field: 'priority', header: 'Độ Ưu Tiên', width: '130px' },
    { field: 'status', header: 'Trạng Thái', width: '140px' },
    { field: 'description', header: 'Mô Tả Sự Cố' },
    { field: 'createdAt', header: 'Ngày Báo Hỏng', width: '160px' },
    { field: 'actions', header: 'Thao Tác', width: '140px', align: 'center' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.ticketService.getTickets(
      this.currentPage(),
      this.pageSize(),
      this.selectedStatus(),
      this.selectedPriority()
    ).subscribe();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
  }

  saveTicket() {
    if (!this.newDescription()) return;

    const req: CreateTicketRequest = {
      issueType: this.newIssueType(),
      priority: this.newPriority(),
      description: this.newDescription()
    };

    this.ticketService.createTicket(req).subscribe({
      next: () => {
        this.isCreateModalOpen.set(false);
        this.newDescription.set('');
        this.loadData();
      }
    });
  }

  resolveTicket(id: string) {
    this.ticketService.resolveTicket(id, 'Đã hoàn tất xử lý tại địa bàn Merchant').subscribe({
      next: () => this.loadData()
    });
  }
}
