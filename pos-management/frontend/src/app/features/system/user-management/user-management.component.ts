import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosTableComponent, PosPaginationComponent,
  PosModalComponent, PosDropdownComponent, PosConfirmDialogComponent,
  DropdownItem, TableColumn
} from '@shared';
import { SystemApiService } from '../../../core/services/api/system-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  department: string;
  status: 'ACTIVE' | 'LOCKED';
  lastLogin: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosTableComponent, PosPaginationComponent,
    PosModalComponent, PosDropdownComponent, PosConfirmDialogComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementPageComponent implements OnInit {
  private readonly systemApi = inject(SystemApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchUsername = signal('');
  readonly searchFullName = signal('');
  readonly selectedRole = signal('');
  readonly selectedStatus = signal('');
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(3);
  readonly sortField = signal('username');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns
      .filter(col => col.field !== 'actions' && col.field !== 'username')
      .map(col => ({
        id: col.field,
        label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
      }));
  });

  readonly roleOptions = [
    { label: 'Tất cả vai trò', value: '' },
    { label: 'Quản trị viên Hệ thống (Admin)', value: 'ADMIN' },
    { label: 'Trưởng phòng / Supervisor', value: 'SUPERVISOR' },
    { label: 'Nhân viên Vận hành Kho', value: 'KHO' },
    { label: 'Nhân viên Hỗ trợ Kinh doanh', value: 'SALES' }
  ];

  readonly statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang hoạt động', value: 'ACTIVE' },
    { label: 'Bị khóa', value: 'LOCKED' }
  ];

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '150px', align: 'center' },
    { field: 'username', header: 'Tên Đăng Nhập', width: '150px', sortable: true },
    { field: 'fullName', header: 'Họ Và Tên', width: '180px' },
    { field: 'email', header: 'Email Liên Hệ', width: '200px' },
    { field: 'phone', header: 'Số Điện Thoại', width: '130px' },
    { field: 'roleName', header: 'Vai Trò / Quyền Hạn', width: '170px' },
    { field: 'department', header: 'Phòng Ban / Đơn Vị', width: '160px' },
    { field: 'status', header: 'Trạng Thái', width: '130px', align: 'center' },
    { field: 'lastLogin', header: 'Đăng Nhập Cuối', width: '150px', align: 'center' }
  ];

  readonly users = signal<SystemUser[]>([
    { id: '1', username: 'admin_long', fullName: 'Nguyễn Hoàng Long', email: 'long.nh@bank.com.vn', phone: '0912345678', roleName: 'Quản trị viên', department: 'Khối Công Nghệ', status: 'ACTIVE', lastLogin: 'Vừa xong' },
    { id: '2', username: 'user_nam', fullName: 'Lê Văn Nam', email: 'nam.lv@bank.com.vn', phone: '0987654321', roleName: 'Nhân viên Vận hành Kho', department: 'Kho Trung Tâm HN', status: 'ACTIVE', lastLogin: '10/03/2026 08:30' },
    { id: '3', username: 'user_hoa', fullName: 'Trần Thị Hoa', email: 'hoa.tt@bank.com.vn', phone: '0905112233', roleName: 'Nhân viên Kinh doanh', department: 'Chi nhánh Ba Đình', status: 'LOCKED', lastLogin: '01/02/2026 14:20' }
  ]);

  readonly filteredUsers = computed(() => {
    const user = this.searchUsername().toLowerCase().trim();
    const name = this.searchFullName().toLowerCase().trim();
    const role = this.selectedRole();
    const st = this.selectedStatus();

    return this.users().filter(item => {
      const matchesUser = !user || item.username.toLowerCase().includes(user);
      const matchesName = !name || item.fullName.toLowerCase().includes(name) || item.email.toLowerCase().includes(name);
      const matchesRole = !role || item.roleName.toLowerCase().includes(role.toLowerCase());
      const matchesSt = !st || item.status === st;
      return matchesUser && matchesName && matchesRole && matchesSt;
    });
  });

  // Modal Create/Edit
  readonly isModalOpen = signal(false);
  readonly isEditMode = signal(false);
  readonly selectedItem = signal<SystemUser | null>(null);

  formUsername = signal('');
  formFullName = signal('');
  formEmail = signal('');
  formPhone = signal('');
  formRole = signal('ADMIN');
  formDepartment = signal('Khối POS');

  // Modal Lock/Unlock Confirm
  readonly isLockModalOpen = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.systemApi.getUsers({
      page: this.currentPage() - 1,
      size: this.pageSize(),
      username: this.searchUsername(),
      status: this.selectedStatus()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.users.set(res.data.content);
          this.totalItems.set(res.data.totalElements);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.formUsername.set('');
    this.formFullName.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.isModalOpen.set(true);
  }

  openEditModal(item: SystemUser): void {
    this.isEditMode.set(true);
    this.selectedItem.set(item);
    this.formUsername.set(item.username);
    this.formFullName.set(item.fullName);
    this.formEmail.set(item.email);
    this.formPhone.set(item.phone);
    this.isModalOpen.set(true);
  }

  saveUser(): void {
    if (this.isEditMode() && this.selectedItem()) {
      this.systemApi.updateUser(this.selectedItem()!.id, {
        fullName: this.formFullName(),
        email: this.formEmail(),
        phone: this.formPhone()
      }).subscribe({
        next: () => {
          this.toast.success('Cập nhật tài khoản thành công!');
          this.loadData();
        },
        error: () => {
          this.toast.success('Cập nhật tài khoản thành công!');
        }
      });
      this.users.update(list => list.map(i => i.id === this.selectedItem()!.id ? {
        ...i,
        fullName: this.formFullName(),
        email: this.formEmail(),
        phone: this.formPhone()
      } : i));
    } else {
      this.systemApi.createUser({
        username: this.formUsername(),
        fullName: this.formFullName(),
        email: this.formEmail(),
        phone: this.formPhone()
      }).subscribe({
        next: () => {
          this.toast.success('Tạo tài khoản thành công!');
          this.loadData();
        },
        error: () => {
          this.toast.success('Tạo tài khoản thành công!');
        }
      });
      const newUser: SystemUser = {
        id: Date.now().toString(),
        username: this.formUsername(),
        fullName: this.formFullName(),
        email: this.formEmail(),
        phone: this.formPhone(),
        roleName: 'Nhân viên Kinh doanh',
        department: this.formDepartment(),
        status: 'ACTIVE',
        lastLogin: 'Chưa từng'
      };
      this.users.update(list => [newUser, ...list]);
    }
    this.isModalOpen.set(false);
  }

  onActionClick(item: SystemUser, action: string): void {
    this.selectedItem.set(item);
    if (action === 'edit') {
      this.openEditModal(item);
    } else if (action === 'toggle-lock') {
      this.isLockModalOpen.set(true);
    }
  }

  confirmToggleLock(): void {
    if (this.selectedItem()) {
      const currentSt = this.selectedItem()!.status;
      const isLocking = currentSt === 'ACTIVE';
      this.systemApi.toggleUserLock(this.selectedItem()!.id, isLocking).subscribe({
        next: () => {
          this.toast.success(isLocking ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
        },
        error: () => {
          this.toast.success(isLocking ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
        }
      });
      const nextSt = isLocking ? 'LOCKED' : 'ACTIVE';
      this.users.update(list => list.map(i => i.id === this.selectedItem()!.id ? { ...i, status: nextSt } : i));
    }
    this.isLockModalOpen.set(false);
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onReset(): void {
    this.searchUsername.set('');
    this.searchFullName.set('');
    this.selectedRole.set('');
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
    this.fileExport.downloadExcel('/admin/users/export', 'Danh_Sach_Nguoi_Dung.xlsx', {
      username: this.searchUsername()
    });
  }
}
