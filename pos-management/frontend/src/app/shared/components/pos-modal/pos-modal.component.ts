import {
  ChangeDetectionStrategy, Component, Input, Output,
  EventEmitter, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * PosModalComponent — Hộp thoại Modal / Dialog dùng chung cho toàn hệ thống POS.
 *
 * ## Sử dụng:
 * ```html
 * <pos-modal
 *   [isOpen]="showModal"
 *   title="Thêm mới Merchant"
 *   subtitle="Nhập thông tin đối tác mới"
 *   size="lg"
 *   (closed)="showModal = false"
 * >
 *   <div class="form-grid">
 *     <!-- Content -->
 *   </div>
 *
 *   <div modal-footer>
 *     <pos-button variant="ghost" (clicked)="showModal = false">Hủy</pos-button>
 *     <pos-button variant="primary" (clicked)="save()">Lưu thông tin</pos-button>
 *   </div>
 * </pos-modal>
 * ```
 */
@Component({
  selector: 'pos-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="pos-modal-backdrop" (click)="onBackdropClick($event)">
        <div
          class="pos-modal-container pos-modal--{{ size }}"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="pos-modal-header">
            <div class="pos-modal-title-area">
              @if (icon) {
                <div class="pos-modal-icon-wrap">
                  <span class="material-icons">{{ icon }}</span>
                </div>
              }
              <div>
                <h3 class="pos-modal-title">{{ title }}</h3>
                @if (subtitle) {
                  <p class="pos-modal-subtitle">{{ subtitle }}</p>
                }
              </div>
            </div>

            @if (showCloseButton) {
              <button
                type="button"
                class="pos-modal-close-btn"
                (click)="close()"
                aria-label="Đóng"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            }
          </div>

          <!-- Body -->
          <div class="pos-modal-body">
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="pos-modal-footer">
            <ng-content select="[modal-footer]" />
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './pos-modal.component.scss'
})
export class PosModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() size: ModalSize = 'md';
  @Input() closeOnBackdrop = true;
  @Input() showCloseButton = true;

  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }
}
