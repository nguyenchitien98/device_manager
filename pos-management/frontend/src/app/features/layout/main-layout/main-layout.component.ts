import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from '../../../core/models/auth.models';

/**
 * Main Layout Component — Shell bao gồm Sidebar + Header + Content Area.
 *
 * Mọi route cần đăng nhập đều render trong layout này.
 * Sidebar menu được generate theo permissions của user hiện tại.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ─── Signals ────────────────────────────────────────────────────
  readonly isSidebarCollapsed = signal(false);
  readonly isMobileSidebarOpen = signal(false);
  readonly activeRoute = signal('');

  // ─── Computed from auth state ────────────────────────────────────
  readonly currentUser = this.authService.currentUser;

  /**
   * Menu items được lọc theo permissions của user.
   * Computed signal sẽ tự tính lại khi userPermissions thay đổi.
   */
  readonly menuItems = computed<MenuItem[]>(() => {
    const perms = this.authService.userPermissions();
    const has = (p: string) => perms.includes(p);

    const allMenus: (MenuItem & { show: boolean })[] = [
      {
        label: 'Dashboard', icon: 'dashboard', route: '/dashboard',
        show: true
      },

      // ─── Quản lý Danh Mục ────────────────────────────
      {
        label: 'Danh Mục Thiết Bị', icon: 'category', route: '/catalog',
        permission: 'CATALOG_VIEW',
        show: has('CATALOG_VIEW')
      },

      // ─── Kho / Inventory ──────────────────────────────
      {
        label: 'Nhập Kho', icon: 'add_box', route: '/inventory/import',
        permission: 'INVENTORY_IMPORT',
        show: has('INVENTORY_IMPORT') || has('INVENTORY_APPROVE')
      },
      {
        label: 'Xuất Kho', icon: 'output', route: '/inventory/export',
        permission: 'INVENTORY_EXPORT',
        show: has('INVENTORY_EXPORT') || has('INVENTORY_APPROVE')
      },
      {
        label: 'Điều Chuyển Kho', icon: 'swap_horiz', route: '/inventory/transfer',
        permission: 'INVENTORY_TRANSFER',
        show: has('INVENTORY_TRANSFER') || has('INVENTORY_APPROVE')
      },
      {
        label: 'Tồn Kho', icon: 'inventory_2', route: '/inventory/stock',
        permission: 'INVENTORY_VIEW',
        show: has('INVENTORY_VIEW')
      },

      // ─── Merchant ─────────────────────────────────────
      {
        label: 'Merchant', icon: 'storefront', route: '/merchants',
        permission: 'MERCHANT_VIEW',
        show: has('MERCHANT_VIEW')
      },

      // ─── Assignment ───────────────────────────────────
      {
        label: 'Cấp Phát Thiết Bị', icon: 'send', route: '/assignments',
        permission: 'ASSIGNMENT_VIEW',
        show: has('ASSIGNMENT_VIEW')
      },

      // ─── Device ───────────────────────────────────────
      {
        label: 'Vòng Đời Thiết Bị', icon: 'devices', route: '/devices',
        permission: 'DEVICE_VIEW',
        show: has('DEVICE_VIEW')
      },

      // ─── Approval ─────────────────────────────────────
      {
        label: 'Phê Duyệt', icon: 'task_alt', route: '/approvals',
        permission: 'APPROVAL_VIEW',
        show: has('APPROVAL_VIEW')
      },

      // ─── Report ───────────────────────────────────────
      {
        label: 'Báo Cáo', icon: 'bar_chart', route: '/reports',
        permission: 'REPORT_VIEW',
        show: has('REPORT_VIEW')
      },

      // ─── Audit ────────────────────────────────────────
      {
        label: 'Audit Log', icon: 'history', route: '/audit',
        permission: 'AUDIT_VIEW',
        show: has('AUDIT_VIEW')
      },

      // ─── Admin ────────────────────────────────────────
      {
        label: 'Người Dùng', icon: 'manage_accounts', route: '/admin/users',
        permission: 'ADMIN_USER_MANAGE',
        show: has('ADMIN_USER_MANAGE')
      },
      {
        label: 'Phân Quyền', icon: 'security', route: '/admin/roles',
        permission: 'ADMIN_ROLE_MANAGE',
        show: has('ADMIN_ROLE_MANAGE')
      },
    ];

    return allMenus.filter(m => m.show);
  });

  constructor() {
    // Track active route for sidebar highlighting
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.activeRoute.set(e.urlAfterRedirects ?? e.url);
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }

  isActive(route?: string): boolean {
    if (!route) return false;
    return this.activeRoute().startsWith(route);
  }
}
