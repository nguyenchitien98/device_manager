import {
  ChangeDetectionStrategy, Component, Input, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
export type BtnSize    = 'xs' | 'sm' | 'md' | 'lg';

/**
 * PosButtonComponent — Nút chung toàn hệ thống.
 */
@Component({
  selector: 'pos-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <button
      class="pos-btn pos-btn--{{ variant }} pos-btn--{{ size }}"
      [class.pos-btn--loading]="loading"
      [class.pos-btn--icon-only]="iconOnly"
      [class.pos-btn--pill]="pill"
      [disabled]="disabled || loading"
      [attr.id]="btnId || null"
      [type]="type"
      (click)="!disabled && !loading && clicked.emit($event)"
    >
      @if (loading) {
        <span class="pos-btn__spinner" aria-hidden="true"></span>
      }
      <span class="pos-btn__content" [class.pos-btn__content--hidden]="loading">
        <ng-content />
      </span>
    </button>
  `,
  styleUrl: './pos-button.component.scss',
})
export class PosButtonComponent {
  @Input() variant: BtnVariant = 'secondary';
  @Input() size: BtnSize       = 'md';
  @Input() loading             = false;
  @Input() disabled            = false;
  @Input() iconOnly            = false;
  @Input() pill                = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  /** Đặt id HTML cho automation/test */
  @Input() btnId               = '';
  @Output() clicked            = new EventEmitter<MouseEvent>();
}
