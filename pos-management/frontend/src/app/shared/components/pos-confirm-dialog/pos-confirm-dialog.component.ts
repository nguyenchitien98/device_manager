import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosButtonComponent } from '../pos-button/pos-button.component';
import { PosModalComponent } from '../pos-modal/pos-modal.component';

import { TranslatePipe } from '../../pipes/translate.pipe';

export type ConfirmType = 'danger' | 'warning' | 'info';

@Component({
  selector: 'pos-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosModalComponent, PosButtonComponent, TranslatePipe],
  template: `
    <pos-modal
      [isOpen]="isOpen"
      [title]="title || ('COMMON.CONFIRM_DELETE_TITLE' | translate)"
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
        <p class="pos-confirm-message">{{ message || ('COMMON.CONFIRM_DELETE_MSG' | translate) }}</p>
      </div>

      <div modal-footer class="pos-confirm-footer">
        <pos-button
          variant="ghost"
          [disabled]="loading"
          (clicked)="cancel.emit()"
        >
          {{ cancelText || ('COMMON.CANCEL' | translate) }}
        </pos-button>

        <pos-button
          [variant]="type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'"
          [loading]="loading"
          (clicked)="confirm.emit()"
        >
          {{ confirmText || ('COMMON.CONFIRM' | translate) }}
        </pos-button>
      </div>
    </pos-modal>
  `,
  styleUrl: './pos-confirm-dialog.component.scss'
})
export class PosConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() message = '';
  @Input() type: ConfirmType = 'danger';
  @Input() confirmText = '';
  @Input() cancelText = '';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
