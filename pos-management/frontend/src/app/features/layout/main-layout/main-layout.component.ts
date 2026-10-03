import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

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
    { label: 'MCC', url: '/catalog/mcc' },
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
  '/inventory/exports': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/exports' },
    { label: 'Thông tin Xuất kho', url: '/inventory/exports' },
  ],
  '/inventory/stock': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/stock' },
    { label: 'Thông tin tồn kho', url: '/inventory/stock' },
  ],
  '/inventory/transfers': [
    { label: 'Quản Lý Xuất/Nhập Kho', url: '/inventory/transfers' },
    { label: 'Điều chuyển kho', url: '/inventory/transfers' },
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
  '/assignment/history': [
    { label: 'Quản Lý Assignment', url: '/assignment/list' },
    { label: 'Lịch sử assignment', url: '/assignment/history' },
  ],
  '/approval/inbox': [
    { label: 'Quy Trình Nghiệp Vụ', url: '/approval/inbox' },
    { label: 'Hộp việc cần duyệt', url: '/approval/inbox' },
  ],
  '/monitoring/pos': [
    { label: 'Báo Cáo & Hệ Thống', url: '/monitoring/pos' },
    { label: 'Giám sát hệ thống', url: '/monitoring/pos' },
  ],
  '/reports': [
    { label: 'Báo Cáo & Hệ Thống', url: '/reports' },
    { label: 'Báo cáo', url: '/reports' },
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
  '/inventory/exports': 'Thông tin Xuất kho',
  '/inventory/stock': 'Thông tin tồn kho',
  '/inventory/transfers': 'Điều chuyển kho',
  '/merchant/merchants': 'Danh sách Merchant',
  '/merchant/terminals': 'Quản lý TID',
  '/device/search': 'Tra cứu thiết bị',
  '/assignment/list': 'Quản lý Assignment',
  '/assignment/history': 'Lịch sử Assignment',
  '/approval/inbox': 'Hộp việc cần duyệt',
  '/monitoring/pos': 'Giám sát hệ thống',
  '/reports': 'Báo cáo',
};

/**
 * Main Layout Component — App shell bao gồm Sidebar, Header, Content.
 * Quản lý: Dual Theme, Sidebar collapse, User menu, Breadcrumb.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ─── Signals ────────────────────────────────────────────────────
  readonly isSidebarCollapsed = signal(false);
  readonly isDarkMode = signal(false);
  readonly isUserMenuOpen = signal(false);
  readonly activeRoute = signal('/dashboard');
  readonly approvalBadge = signal(8);
  readonly notificationCount = signal(8);

  /** Mỗi group key: true = expanded */
  readonly expandedGroups = signal<Record<string, boolean>>({
    catalog: true,
  });

  // ─── Derived from Auth ───────────────────────────────────────────
  readonly currentUser = this.authService.currentUser;

  readonly userInitials = computed(() => {
    const name = this.currentUser()?.fullName ?? 'Admin User';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

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
    this.autoExpandGroup(initialUrl);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const currentUrl = (e.urlAfterRedirects ?? e.url).split('?')[0];
      this.activeRoute.set(currentUrl);
      this.autoExpandGroup(currentUrl);
      this.isUserMenuOpen.set(false); // đóng dropdown khi navigate
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

  /** Auto expand active route group */
  private autoExpandGroup(url: string): void {
    if (url.startsWith('/catalog') || url.startsWith('/organization') || url.startsWith('/inventory/purchase-orders')) {
      this.expandedGroups.set({ catalog: true });
    } else if (url.startsWith('/merchant')) {
      this.expandedGroups.set({ merchant: true });
    } else if (url.startsWith('/inventory')) {
      this.expandedGroups.set({ inventory: true });
    } else if (url.startsWith('/device')) {
      this.expandedGroups.set({ device: true });
    } else if (url.startsWith('/assignment')) {
      this.expandedGroups.set({ assignment: true });
    } else if (url.startsWith('/approval')) {
      this.expandedGroups.set({ workflow: true });
    } else if (url.startsWith('/monitoring') || url.startsWith('/reports')) {
      this.expandedGroups.set({ system: true });
    }
  }

  /** Toggle accordion group — chỉ mở 1 nhóm danh mục cha duy nhất tại một thời điểm */
  toggleGroup(key: string): void {
    this.expandedGroups.update(prev => {
      const isCurrentlyOpen = !!prev[key];
      // Nếu nhóm đang mở -> đóng lại. Nếu nhóm đang đóng -> mở duy nhất nhóm được click (đóng toàn bộ các nhóm khác)
      return isCurrentlyOpen ? {} : { [key]: true };
    });
  }

  /** Kiểm tra group có đang mở không */
  isGroupOpen(key: string): boolean {
    return !!this.expandedGroups()[key];
  }

  /** Toggle user menu dropdown */
  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  /** Đóng user menu */
  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  /** Đăng xuất */
  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
  }

  /** Kiểm tra route có active không */
  isActive(route: string): boolean {
    const current = this.activeRoute();
    return current === route || current.startsWith(route + '/');
  }

  /** Đóng user menu khi click outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen.set(false);
    }
  }
}
