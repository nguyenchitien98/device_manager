import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/** Breadcrumb item */
interface Breadcrumb {
  label: string;
  url: string;
}

/** Mapping route → breadcrumb */
const BREADCRUMB_MAP: Record<string, Breadcrumb[]> = {
  '/dashboard': [{ label: 'Dashboard', url: '/dashboard' }],
  '/catalog/device-categories': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Device Category', url: '/catalog/device-categories' },
  ],
  '/catalog/device-types': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Device Type', url: '/catalog/device-types' },
  ],
  '/catalog/device-models': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Device Model', url: '/catalog/device-models' },
  ],
  '/catalog/vendors': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Vendor', url: '/catalog/vendors' },
  ],
  '/catalog/mcc': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Quản lý MCC', url: '/catalog/mcc' },
  ],
  '/catalog/fee-policies': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Chính sách phí', url: '/catalog/fee-policies' },
  ],
  '/organization/business-units': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Đơn vị Kinh doanh', url: '/organization/business-units' },
  ],
  '/organization/warehouses': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Quản lý kho', url: '/organization/warehouses' },
  ],
  '/inventory/purchase-orders': [
    { label: 'Quản Lý Danh Mục', url: '/catalog/device-categories' },
    { label: 'Purchase order', url: '/inventory/purchase-orders' },
  ],
  '/inventory/imports': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/imports' },
    { label: 'Thông tin Nhập kho', url: '/inventory/imports' },
  ],
  '/inventory/import-create': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/imports' },
    { label: 'Tạo phiếu Nhập kho', url: '/inventory/import-create' },
  ],
  '/inventory/exports': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/exports' },
    { label: 'Thông tin Xuất kho', url: '/inventory/exports' },
  ],
  '/inventory/export-create': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/exports' },
    { label: 'Tạo phiếu Xuất kho', url: '/inventory/export-create' },
  ],
  '/inventory/stock': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/stock' },
    { label: 'Thông tin tồn kho', url: '/inventory/stock' },
  ],
  '/inventory/transfers': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/transfers' },
    { label: 'Điều chuyển kho', url: '/inventory/transfers' },
  ],
  '/inventory/transfer-create': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/transfers' },
    { label: 'Tạo phiếu Điều chuyển', url: '/inventory/transfer-create' },
  ],
  '/inventory/logistics': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/logistics' },
    { label: 'Theo dõi vận chuyển', url: '/inventory/logistics' },
  ],
  '/merchant/merchants': [
    { label: 'Quản Lý Merchant', url: '/merchant/merchants' },
    { label: 'Danh sách Merchant', url: '/merchant/merchants' },
  ],
  '/merchant/terminals': [
    { label: 'Quản Lý Merchant', url: '/merchant/merchants' },
    { label: 'Quản lý TID', url: '/merchant/terminals' },
  ],
  '/device/search': [
    { label: 'Quản Lý Thiết Bị', url: '/device/search' },
    { label: 'Tra cứu thiết bị', url: '/device/search' },
  ],
  '/assignment/list': [
    { label: 'Quản Lý Assignment', url: '/assignment/list' },
    { label: 'Quản lý assignment', url: '/assignment/list' },
  ],
  '/assignment/create': [
    { label: 'Quản Lý Assignment', url: '/assignment/list' },
    { label: 'Tạo lệnh assignment', url: '/assignment/create' },
  ],
  '/assignment/history': [
    { label: 'Quản Lý Assignment', url: '/assignment/list' },
    { label: 'Lịch sử assignment', url: '/assignment/history' },
  ],
  '/approval/inbox': [
    { label: 'Quy Trình Nghiệp Vụ', url: '/approval/inbox' },
    { label: 'Hộp việc cần duyệt', url: '/approval/inbox' },
  ],
  '/monitoring/pos': [
    { label: 'Báo Cáo & Giám Sát', url: '/monitoring/pos' },
    { label: 'Giám sát hệ thống Realtime', url: '/monitoring/pos' },
  ],
  '/monitoring/audit-logs': [
    { label: 'Báo Cáo & Giám Sát', url: '/monitoring/pos' },
    { label: 'Nhật ký tác động (Audit Logs)', url: '/monitoring/audit-logs' },
  ],
  '/reports/inventory': [
    { label: 'Báo Cáo & Giám Sát', url: '/reports/inventory' },
    { label: 'Báo cáo tồn kho', url: '/reports/inventory' },
  ],
  '/reports/merchant': [
    { label: 'Báo Cáo & Giám Sát', url: '/reports/merchant' },
    { label: 'Báo cáo merchant', url: '/reports/merchant' },
  ],
  '/system/users': [
    { label: 'Quản Trị Hệ Thống', url: '/system/users' },
    { label: 'Quản lý người dùng', url: '/system/users' },
  ],
  '/system/roles': [
    { label: 'Quản Trị Hệ Thống', url: '/system/roles' },
    { label: 'Quản lý vai trò & quyền', url: '/system/roles' },
  ],
  '/system/config': [
    { label: 'Quản Trị Hệ Thống', url: '/system/config' },
    { label: 'Cấu hình tham số', url: '/system/config' },
  ],
  '/system/profile': [
    { label: 'Tài Khoản Cá Nhân', url: '/system/profile' },
    { label: 'Hồ sơ cá nhân', url: '/system/profile' },
  ],
};

/** Mapping route → page title hiển thị trên header */
const PAGE_TITLE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalog/device-categories': 'Device Category',
  '/catalog/device-types': 'Device Type',
  '/catalog/device-models': 'Device Model',
  '/catalog/vendors': 'Vendor',
  '/catalog/mcc': 'Quản lý MCC',
  '/catalog/fee-policies': 'Chính sách phí',
  '/organization/business-units': 'Đơn vị Kinh doanh',
  '/organization/warehouses': 'Quản lý kho',
  '/inventory/purchase-orders': 'Purchase Order',
  '/inventory/imports': 'Thông tin Nhập kho',
  '/inventory/import-create': 'Tạo Phiếu Nhập Kho',
  '/inventory/exports': 'Thông tin Xuất kho',
  '/inventory/export-create': 'Tạo Phiếu Xuất Kho',
  '/inventory/stock': 'Thông tin Tồn kho',
  '/inventory/transfers': 'Điều chuyển kho',
  '/inventory/transfer-create': 'Tạo Phiếu Điều Chuyển',
  '/inventory/logistics': 'Theo dõi Vận chuyển',
  '/merchant/merchants': 'Danh sách Merchant',
  '/merchant/terminals': 'Quản lý TID',
  '/device/search': 'Tra cứu thiết bị',
  '/assignment/list': 'Quản lý Assignment',
  '/assignment/create': 'Tạo Lệnh Assignment',
  '/assignment/history': 'Lịch sử Assignment',
  '/approval/inbox': 'Hộp việc cần duyệt',
  '/monitoring/pos': 'Giám sát hệ thống',
  '/monitoring/audit-logs': 'Nhật ký tác động (Audit Logs)',
  '/reports/inventory': 'Báo cáo tồn kho',
  '/reports/merchant': 'Báo cáo merchant',
  '/system/users': 'Quản lý người dùng',
  '/system/roles': 'Quản lý vai trò',
  '/system/config': 'Cấu hình hệ thống',
  '/system/profile': 'Thông tin cá nhân',
};

/**
 * Main Layout Component — App shell bao gồm Sidebar, Header, Content.
 * Composed từ Standalone Components: HeaderComponent & SidebarComponent.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ─── Signals ────────────────────────────────────────────────────
  readonly isSidebarCollapsed = signal(false);
  readonly isDarkMode = signal(false);
  readonly activeRoute = signal('/dashboard');
  readonly approvalBadge = signal(8);
  readonly notificationCount = signal(8);

  // ─── Derived from Auth ───────────────────────────────────────────
  readonly currentUser = this.authService.currentUser;

  // ─── Page title & Breadcrumb ─────────────────────────────────────
  readonly currentPageTitle = computed(() => {
    const route = this.activeRoute();
    for (const key of Object.keys(PAGE_TITLE_MAP)) {
      if (route === key || route.startsWith(key + '/')) {
        return PAGE_TITLE_MAP[key];
      }
    }
    return 'POS Management';
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    const route = this.activeRoute();
    if (route === '/dashboard') return [];
    for (const key of Object.keys(BREADCRUMB_MAP)) {
      if (route === key || route.startsWith(key + '/')) {
        return BREADCRUMB_MAP[key];
      }
    }
    return [];
  });

  ngOnInit(): void {
    // Khôi phục theme từ localStorage
    const saved = localStorage.getItem('pos_theme');
    if (saved === 'dark') {
      this.isDarkMode.set(true);
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.add('theme-light');
    }

    // Khôi phục sidebar state
    const sidebarState = localStorage.getItem('pos_sidebar_collapsed');
    if (sidebarState === 'true') {
      this.isSidebarCollapsed.set(true);
    }

    // Track route changes
    const initialUrl = this.router.url.split('?')[0];
    this.activeRoute.set(initialUrl);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const currentUrl = (e.urlAfterRedirects ?? e.url).split('?')[0];
      this.activeRoute.set(currentUrl);
    });
  }

  /** Toggle sidebar collapsed state */
  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => {
      const next = !v;
      localStorage.setItem('pos_sidebar_collapsed', String(next));
      return next;
    });
  }

  /** Toggle Light / Dark theme */
  toggleTheme(): void {
    this.isDarkMode.update(v => {
      const next = !v;
      document.body.classList.toggle('theme-dark', next);
      document.body.classList.toggle('theme-light', !next);
      localStorage.setItem('pos_theme', next ? 'dark' : 'light');
      return next;
    });
  }

  /** Đăng xuất */
  logout(): void {
    this.authService.logout();
  }
}
