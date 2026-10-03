import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'gray' | 'purple';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * PosBadgeComponent — Hiển thị nhãn/trạng thái dùng chung trong bảng, card, header.
 *
 * ## Sử dụng:
 * ```html
 * <pos-badge variant="success" [dot]="true">Hoạt động</pos-badge>
 * <pos-badge variant="danger" size="sm">Đã khóa</pos-badge>
 * ```
 */
@Component({
  selector: 'pos-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <span
      class="pos-badge pos-badge--{{ variant }} pos-badge--{{ size }}"
      [class.pos-badge--pill]="pill"
    >
      @if (dot) {
        <span class="pos-badge__dot"></span>
      }
      @if (icon) {
        <span class="material-icons pos-badge__icon">{{ icon }}</span>
      }
      <span class="pos-badge__content">
        <ng-content />
      </span>
    </span>
  `,
  styleUrl: './pos-badge.component.scss'
})
export class PosBadgeComponent {
  @Input() variant: BadgeVariant = 'gray';
  @Input() size: BadgeSize = 'md';
  @Input() dot = false;
  @Input() pill = false;
  @Input() icon = '';
}
