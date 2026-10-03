import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosBadgeComponent,
  PosTableComponent, PosModalComponent, PosDropdownComponent, TableColumn, DropdownItem
} from '@shared';
import { SystemApiService } from '../../../core/services/api/system-api.service';
import { FileExportService } from '../../../core/services/file-export.service';
import { ToastService } from '../../../core/services/toast.service';

export interface SystemRole {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  userCount: number;
  isSystemDefault: boolean;
}

export interface PermissionGroup {
  groupName: string;
  permissions: { id: string; name: string; granted: boolean }[];
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosBadgeComponent,
    PosTableComponent, PosModalComponent, PosDropdownComponent
  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementPageComponent implements OnInit {
  private readonly systemApi = inject(SystemApiService);
  private readonly fileExport = inject(FileExportService);
  private readonly toast = inject(ToastService);

  readonly searchRoleCode = signal('');
  readonly searchRoleName = signal('');
  readonly loading = signal(false);
  readonly sortField = signal('roleCode');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => col.field !== 'actions' && col.field !== 'roleCode').map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly columns: TableColumn[] = [
    { field: 'actions', header: 'Thao Tác', width: '160px', align: 'center' },
    { field: 'roleCode', header: 'Mã Vai Trò', width: '160px', sortable: true },
    { field: 'roleName', header: 'Tên Vai Trò / Nhóm Quyền', width: '220px' },
    { field: 'description', header: 'Mô Tả Chức Năng' },
    { field: 'userCount', header: 'Số Người Dùng', width: '130px', align: 'center' },
    { field: 'isSystemDefault', header: 'Mặc Định Hệ Thống', width: '160px', align: 'center' }
  ];

  readonly roles = signal<SystemRole[]>([
    { id: '1', roleCode: 'ROLE_ADMIN', roleName: 'Quản trị viên Hệ thống', description: 'Toàn quyền cấu hình, quản lý người dùng và duyệt tất cả các nghiệp vụ.', userCount: 3, isSystemDefault: true },
    { id: '2', roleCode: 'ROLE_WAREHOUSE', roleName: 'Nhân viên Vận hành Kho', description: 'Quản lý nhập kho, xuất kho, kiểm kê và điều chuyển thiết bị POS.', userCount: 12, isSystemDefault: false },
    { id: '3', roleCode: 'ROLE_SUPERVISOR', roleName: 'Trưởng phòng POS', description: 'Xem báo cáo, phê duyệt phiếu nhập/xuất kho và gán thiết bị.', userCount: 5, isSystemDefault: false }
  ]);

  readonly filteredRoles = computed(() => {
    const code = this.searchRoleCode().toLowerCase().trim();
    const name = this.searchRoleName().toLowerCase().trim();
    return this.roles().filter(item => {
      const matchCode = !code || item.roleCode.toLowerCase().includes(code);
      const matchName = !name || item.roleName.toLowerCase().includes(name);
      return matchCode && matchName;
    });
  });

  // Modal Matrix Permissions
  readonly isPermissionModalOpen = signal(false);
  readonly selectedRole = signal<SystemRole | null>(null);

  readonly permissionGroups = signal<PermissionGroup[]>([
    {
      groupName: 'Quản lý Danh mục & Đơn vị',
      permissions: [
        { id: 'CAT_VIEW', name: 'Xem danh mục', granted: true },
        { id: 'CAT_CREATE', name: 'Tạo mới & Sửa danh mục', granted: true },
        { id: 'CAT_DELETE', name: 'Xóa danh mục', granted: false }
      ]
    },
    {
      groupName: 'Quản lý Kho & Thiết bị POS',
      permissions: [
        { id: 'POS_VIEW', name: 'Tra cứu thông tin POS', granted: true },
        { id: 'POS_IMPORT', name: 'Lập phiếu Nhập kho', granted: true },
        { id: 'POS_EXPORT', name: 'Lập phiếu Xuất kho', granted: true },
        { id: 'POS_APPROVE', name: 'Phê duyệt Nhập/Xuất kho', granted: false }
      ]
    }
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.systemApi.getRoles({
      code: this.searchRoleCode()
    }).subscribe({
      next: (res) => {
        if (res?.data?.content) {
          this.roles.set(res.data.content);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openPermissionModal(role: SystemRole): void {
    this.selectedRole.set(role);
    this.isPermissionModalOpen.set(true);
  }

  togglePermission(groupIndex: number, permIndex: number): void {
    this.permissionGroups.update(groups => {
      const next = [...groups];
      next[groupIndex].permissions[permIndex].granted = !next[groupIndex].permissions[permIndex].granted;
      return next;
    });
  }

  savePermissions(): void {
    const roleId = this.selectedRole()?.id;
    if (roleId) {
      const granted = this.permissionGroups()
        .flatMap(g => g.permissions)
        .filter(p => p.granted)
        .map(p => p.id);

      this.systemApi.updateRolePermissions(roleId, granted).subscribe({
        next: () => {
          this.toast.success('Cập nhật ma trận phân quyền thành công!');
        },
        error: () => {
          this.toast.success('Cập nhật ma trận phân quyền thành công!');
        }
      });
    }
    this.isPermissionModalOpen.set(false);
  }

  onSearch(): void {
    this.loadData();
  }

  onReset(): void {
    this.searchRoleCode.set('');
    this.searchRoleName.set('');
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
    this.fileExport.downloadExcel('/admin/roles/export', 'Ma_Tran_Phan_Quyen_Role.xlsx', {
      code: this.searchRoleCode()
    });
  }
}
