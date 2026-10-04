import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state-card" [ngClass]="type">
      <div class="icon-wrapper">
        <span class="material-icons empty-icon">{{ icon }}</span>
      </div>
      <h3 class="empty-title">{{ title || ('COMMON.NO_DATA' | translate) }}</h3>
      <p class="empty-message">{{ message }}</p>

      <div class="empty-actions" *ngIf="actionLabel">
        <button class="btn-action" (click)="actionClicked.emit()">
          <span class="material-icons" *ngIf="actionIcon">{{ actionIcon }}</span>
          <span>{{ actionLabel }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      margin: 24px 0;
      animation: fadeIn 0.3s ease-in-out;
    }

    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .empty-icon {
      font-size: 32px;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .empty-message {
      font-size: 14px;
      color: #64748b;
      max-width: 400px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.1s;

      &:hover {
        background: #1d4ed8;
      }
    }

    /* Variant: search */
    .empty-state-card.search {
      .icon-wrapper {
        background: #eff6ff;
        color: #3b82f6;
      }
    }

    /* Variant: warning */
    .empty-state-card.warning {
      .icon-wrapper {
        background: #fef3c7;
        color: #d97706;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'search_off';
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'search' | 'info' | 'warning' = 'search';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;

  @Output() actionClicked = new EventEmitter<void>();
}
