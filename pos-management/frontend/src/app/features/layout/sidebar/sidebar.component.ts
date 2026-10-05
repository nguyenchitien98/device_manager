import { ChangeDetectionStrategy, Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnChanges {
  @Input() isCollapsed = false;
  @Input() activeRoute = '/dashboard';
  @Input() approvalBadge = 8;

  /** Mỗi group key: true = expanded */
  readonly expandedGroups = signal<Record<string, boolean>>({
    catalog: true
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeRoute'] && changes['activeRoute'].currentValue) {
      this.autoExpandGroup(changes['activeRoute'].currentValue);
    }
  }

  /** Auto expand active route group */
  private autoExpandGroup(url: string): void {
    if (url.startsWith('/catalog') || url.startsWith('/organization') || url.startsWith('/inventory/purchase-orders')) {
      this.expandedGroups.set({ catalog: true });
    } else if (url.startsWith('/merchant')) {
      this.expandedGroups.set({ merchant: true });
    } else if (url.startsWith('/inventory') || url.startsWith('/telecom')) {
      this.expandedGroups.set({ inventory: true });
    } else if (url.startsWith('/device')) {
      this.expandedGroups.set({ device: true });
    } else if (url.startsWith('/assignment')) {
      this.expandedGroups.set({ assignment: true });
    } else if (url.startsWith('/approval')) {
      this.expandedGroups.set({ approval: true });
    } else if (url.startsWith('/monitoring') || url.startsWith('/reports')) {
      this.expandedGroups.set({ reports: true });
    } else if (url.startsWith('/system')) {
      this.expandedGroups.set({ system: true });
    }
  }

  /** Toggle accordion group — chỉ mở 1 nhóm danh mục cha duy nhất tại một thời điểm */
  toggleGroup(key: string): void {
    this.expandedGroups.update(prev => {
      const isCurrentlyOpen = !!prev[key];
      return isCurrentlyOpen ? {} : { [key]: true };
    });
  }

  /** Kiểm tra group có đang mở không */
  isGroupOpen(key: string): boolean {
    return !!this.expandedGroups()[key];
  }

  /** Kiểm tra nhóm danh mục có chứa route active không (dùng cho collapsed mode) */
  isGroupActive(key: string): boolean {
    const url = this.activeRoute || '';
    if (key === 'catalog') {
      return url.startsWith('/catalog') || url.startsWith('/organization') || url.startsWith('/inventory/purchase-orders');
    } else if (key === 'merchant') {
      return url.startsWith('/merchant');
    } else if (key === 'inventory') {
      return url.startsWith('/inventory') && !url.startsWith('/inventory/purchase-orders');
    } else if (key === 'device') {
      return url.startsWith('/device');
    } else if (key === 'assignment') {
      return url.startsWith('/assignment');
    } else if (key === 'approval') {
      return url.startsWith('/approval');
    } else if (key === 'reports') {
      return url.startsWith('/monitoring') || url.startsWith('/reports');
    } else if (key === 'system') {
      return url.startsWith('/system');
    }
    return false;
  }

  /** Kiểm tra route có active không */
  isActive(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }
}
