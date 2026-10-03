import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosBadgeComponent,
  PosTableComponent, PosModalComponent, PosDropdownComponent, TableColumn, DropdownItem
} from '@shared';

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
export class RoleManagementPageComponent {
  readonly searchRoleCode = signal('');
  readonly searchRoleName = signal('');
  readonly loading = signal(false);

  readonly hiddenColumns = signal<Set<string>>(new Set());

  readonly visibleColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns.filter(col => !hidden.has(col.field));
  });

  readonly columnToggleItems = computed<DropdownItem[]>(() => {
    const hidden = this.hiddenColumns();
    return this.columns.map(col => ({
      id: col.field,
      label: (hidden.has(col.field) ? '☐ ' : '☑ ') + col.header
    }));
  });

  readonly columns: TableColumn[] = [
    { field: 'roleCode', header: 'Mã Vai Trò', width: '160px', sortable: true },
    { field: 'roleName', header: 'Tên Vai Trò / Nhóm Quyền', width: '220px' },
    { field: 'description', header: 'Mô Tả Chức Năng' },
    { field: 'userCount', header: 'Số Người Dùng', width: '130px', align: 'center' },
    { field: 'isSystemDefault', header: 'Mặc Định Hệ Thống', width: '160px', align: 'center' },
    { field: 'actions', header: 'Thao Tác Phân Quyền', width: '160px', align: 'center' }
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
    this.isPermissionModalOpen.set(false);
  }

  onSearch(): void {}
  onReset(): void {
    this.searchRoleCode.set('');
    this.searchRoleName.set('');
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
    alert('Xuất báo cáo ma trận vai trò phân quyền thành công!');
  }
}
