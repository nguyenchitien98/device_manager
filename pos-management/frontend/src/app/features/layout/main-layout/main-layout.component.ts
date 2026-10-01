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

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  permission?: string;
}

export interface MenuGroup {
  title: string;
  isExpanded?: boolean;
  items: MenuItem[];
}

/**
 * Main Layout Component — Tuân thủ 100% UI/UX Standard & Dashboard mockup.
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
  readonly activeRoute = signal('/dashboard');
  readonly expandedGroups = signal<Record<string, boolean>>({
    'QUẢN LÝ DANH MỤC': true,
  });

  // ─── Computed user ──────────────────────────────────────────────
  readonly currentUser = this.authService.currentUser;

  /**
   * Menu groups theo đúng hình pos_dashboard_main_1790867196500.png & UI UX Standard
   */
  readonly menuGroups = computed<MenuGroup[]>(() => [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/dashboard' },
      ],
    },
    {
      title: 'QUẢN LÝ DANH MỤC',
      items: [
        { label: 'Device Category', icon: 'grid_view', route: '/catalog/categories' },
        { label: 'Device Type', icon: 'stay_current_portrait', route: '/catalog/types' },
        { label: 'Device Model', icon: 'devices_other', route: '/catalog/models' },
        { label: 'Vendor', icon: 'badge', route: '/catalog/vendors' },
        { label: 'MCC', icon: 'store_mall_directory', route: '/catalog/mcc' },
        { label: 'Business Unit', icon: 'corporate_fare', route: '/catalog/business-units' },
        { label: 'Fee Policy', icon: 'subtitles', route: '/catalog/fee-policies' },
      ],
    },
    {
      title: 'QUẢN LÝ KHO',
      items: [
        { label: 'Nhập kho', icon: 'vertical_align_bottom', route: '/inventory/import' },
        { label: 'Xuất kho', icon: 'vertical_align_top', route: '/inventory/export' },
        { label: 'Tồn kho', icon: 'inventory_2', route: '/inventory/stock' },
        { label: 'Điều chuyển kho', icon: 'compare_arrows', route: '/inventory/transfer' },
      ],
    },
    {
      title: 'QUẢN LÝ MERCHANT',
      items: [
        { label: 'Danh sách Merchant', icon: 'people_outline', route: '/merchants' },
      ],
    },
    {
      title: 'QUẢN LÝ THIẾT BỊ',
      items: [
        { label: 'Vòng đời thiết bị', icon: 'tablet_mac', route: '/devices' },
      ],
    },
    {
      title: 'QUẢN LÝ ASSIGNMENT',
      items: [
        { label: 'Cấp phát thiết bị', icon: 'assignment_ind', route: '/assignments' },
      ],
    },
    {
      title: 'QUY TRÌNH NGHIỆP VỤ',
      items: [
        { label: 'Hộp việc cần duyệt', icon: 'mail_outline', route: '/approvals', badge: 8 },
        { label: 'BÁO CÁO & HỆ THỐNG', icon: 'analytics', route: '/reports' },
      ],
    },
  ]);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.activeRoute.set(e.urlAfterRedirects ?? e.url);
    });
  }

  toggleGroup(title: string): void {
    this.expandedGroups.update(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }

  isGroupExpanded(title: string): boolean {
    return !!this.expandedGroups()[title];
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
    return this.activeRoute() === route || this.activeRoute().startsWith(route + '/');
  }
}
