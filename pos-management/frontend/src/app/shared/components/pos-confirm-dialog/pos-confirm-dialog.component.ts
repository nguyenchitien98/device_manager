import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosButtonComponent } from '../pos-button/pos-button.component';
import { PosModalComponent } from '../pos-modal/pos-modal.component';

export type ConfirmType = 'danger' | 'warning' | 'info';

/**
 * PosConfirmDialogComponent — Hộp thoại xác nhận hành động nguy hiểm/quan trọng (Xóa, Khóa, Cập nhật).
 *
 * ## Sử dụng:
 * ```html
 * <pos-confirm-dialog
 *   [isOpen]="showDeleteConfirm"
 *   title="Xóa Merchant này?"
 *   message="Bạn có chắc chắn muốn xóa Merchant này? Hành động này không thể hoàn tác."
 *   type="danger"
 *   confirmText="Xóa vĩnh viễn"
 *   [loading]="deleting"
 *   (confirm)="onDeleteConfirmed()"
 *   (cancel)="showDeleteConfirm = false"
 * />
 * ```
 */
@Component({
  selector: 'pos-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosModalComponent, PosButtonComponent],
  template: `
    <pos-modal
      [isOpen]="isOpen"
      [title]="title"
      size="sm"
      [showCloseButton]="!loading"
      [closeOnBackdrop]="!loading"
      (closed)="cancel.emit()"
    >
      <div class="pos-confirm-content">
        <div class="pos-confirm-icon pos-confirm-icon--{{ type }}">
          <span class="material-icons">
            @switch (type) {
              @case ('danger') { delete_forever }
              @case ('warning') { warning }
              @case ('info') { info }
            }
          </span>
        </div>
        <p class="pos-confirm-message">{{ message }}</p>
      </div>

      <div modal-footer class="pos-confirm-footer">
        <pos-button
          variant="ghost"
          [disabled]="loading"
          (clicked)="cancel.emit()"
        >
          {{ cancelText }}
        </pos-button>

        <pos-button
          [variant]="type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'"
          [loading]="loading"
          (clicked)="confirm.emit()"
        >
          {{ confirmText }}
        </pos-button>
      </div>
    </pos-modal>
  `,
  styleUrl: './pos-confirm-dialog.component.scss'
})
export class PosConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Xác nhận hành động';
  @Input() message = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() type: ConfirmType = 'danger';
  @Input() confirmText = 'Xác nhận';
  @Input() cancelText = 'Hủy bỏ';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
