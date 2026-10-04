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
import { LanguageService } from '../../../core/services/language.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/** Breadcrumb item interface */
interface BreadcrumbKey {
  labelKey: string;
  url: string;
}

export interface Breadcrumb {
  label: string;
  url: string;
}

/** Mapping route → breadcrumb translation keys */
const BREADCRUMB_MAP: Record<string, BreadcrumbKey[]> = {
  '/dashboard': [{ labelKey: 'NAV.DASHBOARD', url: '/dashboard' }],
  '/catalog/device-categories': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.DEVICE_CATEGORY', url: '/catalog/device-categories' },
  ],
  '/catalog/device-types': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.DEVICE_TYPE', url: '/catalog/device-types' },
  ],
  '/catalog/device-models': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.DEVICE_MODEL', url: '/catalog/device-models' },
  ],
  '/catalog/vendors': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.VENDOR', url: '/catalog/vendors' },
  ],
  '/catalog/mcc': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.MCC', url: '/catalog/mcc' },
  ],
  '/catalog/fee-policies': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.FEE_POLICY', url: '/catalog/fee-policies' },
  ],
  '/organization/business-units': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.BUSINESS_UNIT', url: '/organization/business-units' },
  ],
  '/organization/warehouses': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.WAREHOUSE', url: '/organization/warehouses' },
  ],
  '/inventory/purchase-orders': [
    { labelKey: 'NAV.CATALOG', url: '/catalog/device-categories' },
    { labelKey: 'NAV.PURCHASE_ORDER', url: '/inventory/purchase-orders' },
  ],
  '/inventory/imports': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/imports' },
    { labelKey: 'NAV.IMPORTS', url: '/inventory/imports' },
  ],
  '/inventory/import-create': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/imports' },
    { labelKey: 'INVENTORY_IMPORT.ADD_TITLE', url: '/inventory/import-create' },
  ],
  '/inventory/exports': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/exports' },
    { labelKey: 'NAV.EXPORTS', url: '/inventory/exports' },
  ],
  '/inventory/export-create': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/exports' },
    { labelKey: 'INVENTORY_EXPORT.ADD_TITLE', url: '/inventory/export-create' },
  ],
  '/inventory/stock': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/stock' },
    { labelKey: 'NAV.STOCK', url: '/inventory/stock' },
  ],
  '/inventory/transfers': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/transfers' },
    { labelKey: 'NAV.TRANSFERS', url: '/inventory/transfers' },
  ],
  '/inventory/transfer-create': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/transfers' },
    { labelKey: 'TRANSFER.ADD_TITLE', url: '/inventory/transfer-create' },
  ],
  '/inventory/logistics': [
    { labelKey: 'NAV.INVENTORY_MANAGEMENT', url: '/inventory/logistics' },
    { labelKey: 'NAV.LOGISTICS', url: '/inventory/logistics' },
  ],
  '/merchant/merchants': [
    { labelKey: 'NAV.MERCHANT_MANAGEMENT', url: '/merchant/merchants' },
    { labelKey: 'NAV.MERCHANTS', url: '/merchant/merchants' },
  ],
  '/merchant/terminals': [
    { labelKey: 'NAV.MERCHANT_MANAGEMENT', url: '/merchant/merchants' },
    { labelKey: 'NAV.TERMINALS', url: '/merchant/terminals' },
  ],
  '/device/search': [
    { labelKey: 'NAV.DEVICE_MANAGEMENT', url: '/device/search' },
    { labelKey: 'NAV.DEVICE_SEARCH', url: '/device/search' },
  ],
  '/assignment/list': [
    { labelKey: 'NAV.ASSIGNMENT_MANAGEMENT', url: '/assignment/list' },
    { labelKey: 'NAV.ASSIGNMENTS', url: '/assignment/list' },
  ],
  '/assignment/create': [
    { labelKey: 'NAV.ASSIGNMENT_MANAGEMENT', url: '/assignment/list' },
    { labelKey: 'ASSIGNMENT.ADD_TITLE', url: '/assignment/create' },
  ],
  '/assignment/history': [
    { labelKey: 'NAV.ASSIGNMENT_MANAGEMENT', url: '/assignment/list' },
    { labelKey: 'NAV.ASSIGNMENT_HISTORY', url: '/assignment/history' },
  ],
  '/approval/inbox': [
    { labelKey: 'NAV.WORKFLOW', url: '/approval/inbox' },
    { labelKey: 'NAV.APPROVAL_INBOX', url: '/approval/inbox' },
  ],
  '/monitoring/pos': [
    { labelKey: 'NAV.REPORTS_MONITORING', url: '/monitoring/pos' },
    { labelKey: 'NAV.POS_MONITORING', url: '/monitoring/pos' },
  ],
  '/monitoring/audit-logs': [
    { labelKey: 'NAV.REPORTS_MONITORING', url: '/monitoring/pos' },
    { labelKey: 'NAV.AUDIT_LOGS', url: '/monitoring/audit-logs' },
  ],
  '/reports/inventory': [
    { labelKey: 'NAV.REPORTS_MONITORING', url: '/reports/inventory' },
    { labelKey: 'NAV.REPORT_INVENTORY', url: '/reports/inventory' },
  ],
  '/reports/merchant': [
    { labelKey: 'NAV.REPORTS_MONITORING', url: '/reports/merchant' },
    { labelKey: 'NAV.REPORT_MERCHANT', url: '/reports/merchant' },
  ],
  '/system/users': [
    { labelKey: 'NAV.SYSTEM_ADMIN', url: '/system/users' },
    { labelKey: 'NAV.USERS', url: '/system/users' },
  ],
  '/system/roles': [
    { labelKey: 'NAV.SYSTEM_ADMIN', url: '/system/roles' },
    { labelKey: 'NAV.ROLES', url: '/system/roles' },
  ],
  '/system/config': [
    { labelKey: 'NAV.SYSTEM_ADMIN', url: '/system/config' },
    { labelKey: 'NAV.CONFIG', url: '/system/config' },
  ],
  '/system/profile': [
    { labelKey: 'HEADER.PROFILE', url: '/system/profile' },
    { labelKey: 'NAV.PROFILE', url: '/system/profile' },
  ],
};

/** Mapping route → page title translation keys */
const PAGE_TITLE_MAP: Record<string, string> = {
  '/dashboard': 'NAV.DASHBOARD',
  '/catalog/device-categories': 'NAV.DEVICE_CATEGORY',
  '/catalog/device-types': 'NAV.DEVICE_TYPE',
  '/catalog/device-models': 'NAV.DEVICE_MODEL',
  '/catalog/vendors': 'NAV.VENDOR',
  '/catalog/mcc': 'NAV.MCC',
  '/catalog/fee-policies': 'NAV.FEE_POLICY',
  '/organization/business-units': 'NAV.BUSINESS_UNIT',
  '/organization/warehouses': 'NAV.WAREHOUSE',
  '/inventory/purchase-orders': 'NAV.PURCHASE_ORDER',
  '/inventory/imports': 'NAV.IMPORTS',
  '/inventory/import-create': 'INVENTORY_IMPORT.ADD_TITLE',
  '/inventory/exports': 'NAV.EXPORTS',
  '/inventory/export-create': 'INVENTORY_EXPORT.ADD_TITLE',
  '/inventory/stock': 'NAV.STOCK',
  '/inventory/transfers': 'NAV.TRANSFERS',
  '/inventory/transfer-create': 'TRANSFER.ADD_TITLE',
  '/inventory/logistics': 'NAV.LOGISTICS',
  '/merchant/merchants': 'NAV.MERCHANTS',
  '/merchant/terminals': 'NAV.TERMINALS',
  '/device/search': 'NAV.DEVICE_SEARCH',
  '/assignment/list': 'NAV.ASSIGNMENTS',
  '/assignment/create': 'ASSIGNMENT.ADD_TITLE',
  '/assignment/history': 'NAV.ASSIGNMENT_HISTORY',
  '/approval/inbox': 'NAV.APPROVAL_INBOX',
  '/monitoring/pos': 'NAV.POS_MONITORING',
  '/monitoring/audit-logs': 'NAV.AUDIT_LOGS',
  '/reports/inventory': 'NAV.REPORT_INVENTORY',
  '/reports/merchant': 'NAV.REPORT_MERCHANT',
  '/system/users': 'NAV.USERS',
  '/system/roles': 'NAV.ROLES',
  '/system/config': 'NAV.CONFIG',
  '/system/profile': 'NAV.PROFILE',
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
  readonly langService = inject(LanguageService);

  // ─── Signals ────────────────────────────────────────────────────
  readonly isSidebarCollapsed = signal(false);
  readonly isDarkMode = signal(false);
  readonly activeRoute = signal('/dashboard');
  readonly approvalBadge = signal(8);
  readonly notificationCount = signal(8);

  // ─── Derived from Auth ───────────────────────────────────────────
  readonly currentUser = this.authService.currentUser;

  // ─── Page title & Breadcrumb (i18n reactive) ─────────────────────
  readonly currentPageTitle = computed(() => {
    // Reading currentLang() establishes signal dependency so title re-evaluates on lang toggle
    this.langService.currentLang(); 
    const route = this.activeRoute();
    for (const key of Object.keys(PAGE_TITLE_MAP)) {
      if (route === key || route.startsWith(key + '/')) {
        return this.langService.translate(PAGE_TITLE_MAP[key]);
      }
    }
    return this.langService.translate('NAV.BRAND');
  });

  readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    this.langService.currentLang();
    const route = this.activeRoute();
    if (route === '/dashboard') return [];
    for (const key of Object.keys(BREADCRUMB_MAP)) {
      if (route === key || route.startsWith(key + '/')) {
        return BREADCRUMB_MAP[key].map(item => ({
          label: this.langService.translate(item.labelKey),
          url: item.url
        }));
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
