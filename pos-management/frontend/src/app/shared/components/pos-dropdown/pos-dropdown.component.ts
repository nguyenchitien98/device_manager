import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener,
  Input, Output, EventEmitter, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

/**
 * PosDropdownComponent — Context action menu (...) dùng trong bảng hoặc header.
 *
 * ## Sử dụng:
 * ```html
 * <pos-dropdown
 *   [items]="[
 *     { id: 'view', label: 'Xem chi tiết', icon: 'visibility' },
 *     { id: 'edit', label: 'Chỉnh sửa', icon: 'edit' },
 *     { id: 'delete', label: 'Xóa', icon: 'delete', danger: true }
 *   ]"
 *   (itemClick)="handleAction($event)"
 * />
 * ```
 */
@Component({
  selector: 'pos-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="pos-dropdown-wrap">
      <div (click)="toggleOpen()">
        <ng-content>
          <!-- Default trigger icon if no content provided -->
          <button type="button" class="pos-dropdown-default-trigger" aria-label="Tùy chọn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </ng-content>
      </div>

      @if (isOpen()) {
        <div class="pos-dropdown-menu pos-dropdown-menu--{{ align }}">
          <ul class="pos-dropdown-list">
            @for (item of items; track item.id) {
              @if (item.divider) {
                <li class="pos-dropdown-divider"></li>
              } @else {
                <li
                  class="pos-dropdown-item"
                  [class.pos-dropdown-item--danger]="item.danger"
                  [class.pos-dropdown-item--disabled]="item.disabled"
                  (click)="onItemClick(item, $event)"
                >
                  @if (item.icon) {
                    <span class="material-icons pos-dropdown-icon">{{ item.icon }}</span>
                  }
                  <span class="pos-dropdown-label">{{ item.label }}</span>
                </li>
              }
            }
          </ul>
        </div>
      }
    </div>
  `,
  styleUrl: './pos-dropdown.component.scss'
})
export class PosDropdownComponent {
  @Input() items: DropdownItem[] = [];
  @Input() align: 'left' | 'right' = 'right';

  @Output() itemClick = new EventEmitter<DropdownItem>();

  isOpen = signal<boolean>(false);

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onItemClick(item: DropdownItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;
    this.itemClick.emit(item);
    this.close();
  }
}
