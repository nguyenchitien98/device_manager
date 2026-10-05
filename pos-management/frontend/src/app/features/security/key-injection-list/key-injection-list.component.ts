import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent,
  PosSelectComponent,
  PosBadgeComponent,
  PosTableComponent,
  PosPaginationComponent,
  TableColumn
} from '../../../shared';
import { KeyInjectionService } from '../../../core/services/key-injection.service';
import { KeyInjectionOrder } from '../../../core/models/key-injection.model';

@Component({
  selector: 'app-key-injection-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PosButtonComponent,
    PosSelectComponent,
    PosBadgeComponent,
    PosTableComponent,
    PosPaginationComponent
  ],
  templateUrl: './key-injection-list.component.html',
  styleUrls: ['./key-injection-list.component.scss']
})
export class KeyInjectionListComponent implements OnInit {
  protected service = inject(KeyInjectionService);

  selectedStatus = signal('');
  currentPage = signal(0);
  pageSize = signal(10);

  statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chờ nạp (PENDING)', value: 'PENDING' },
    { label: 'Thành công (SUCCESS)', value: 'SUCCESS' },
    { label: 'Thất bại (FAILED)', value: 'FAILED' }
  ];

  columns: TableColumn[] = [
    { field: 'orderNumber', header: 'Mã Lệnh HSM', width: '180px' },
    { field: 'deviceId', header: 'ID Thiết Bị POS', width: '220px' },
    { field: 'hsmProfileId', header: 'Cấu Hình HSM', width: '200px' },
    { field: 'status', header: 'Trạng Thái', width: '140px' },
    { field: 'hsmResponseCode', header: 'Mã Phản Hồi HSM', width: '160px' },
    { field: 'createdAt', header: 'Ngày Tạo', width: '180px' },
    { field: 'actions', header: 'Thao Tác', width: '160px', align: 'center' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getOrders(
      this.currentPage(),
      this.pageSize(),
      this.selectedStatus()
    ).subscribe();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  executeInjection(id: string) {
    this.service.executeInjection(id).subscribe({
      next: () => this.loadData()
    });
  }
}
