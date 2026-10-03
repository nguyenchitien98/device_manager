import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener,
  Input, Output, EventEmitter, forwardRef, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption<T = unknown> {
  label: string;
  value: T;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

/**
 * PosSelectComponent — Dropdown Select dùng chung cho toàn hệ thống POS.
 *
 * ## Sử dụng:
 * ```html
 * <pos-select
 *   label="Trạng thái"
 *   [options]="statusOptions"
 *   [(ngModel)]="selectedStatus"
 *   placeholder="Tất cả trạng thái"
 *   [searchable]="true"
 *   selectId="select-status"
 * />
 * ```
 */
@Component({
  selector: 'pos-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PosSelectComponent),
    multi: true,
  }],
  template: `
    <div class="pos-select-wrap" [class.pos-select-wrap--error]="!!error" [class.pos-select-wrap--open]="isOpen()">
      @if (label) {
        <label class="pos-select-label" [attr.for]="selectId">
          {{ label }}
          @if (required) { <span class="pos-select-required">*</span> }
        </label>
      }

      <div class="pos-select-control"
           [id]="selectId"
           [class.pos-select-control--disabled]="isDisabled"
           tabindex="0"
           (click)="toggleOpen()"
           (keydown.space)="$event.preventDefault(); toggleOpen()"
           (keydown.enter)="$event.preventDefault(); toggleOpen()"
           (keydown.escape)="close()">

        <div class="pos-select-selection">
          @if (selectedOption(); as opt) {
            <span class="pos-select-selected-val">
              @if (opt.icon) { <span class="material-icons opt-icon">{{ opt.icon }}</span> }
              {{ opt.label }}
            </span>
          } @else {
            <span class="pos-select-placeholder">{{ placeholder }}</span>
          }
        </div>

        <div class="pos-select-actions">
          @if (clearable && selectedValue() !== null && selectedValue() !== undefined && selectedValue() !== '' && !isDisabled) {
            <button type="button" class="pos-select-clear" (click)="$event.stopPropagation(); clear()" aria-label="Xóa chọn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          }
          <span class="pos-select-arrow" [class.pos-select-arrow--open]="isOpen()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div class="pos-select-dropdown">
          @if (searchable) {
            <div class="pos-select-search-box">
              <input
                type="text"
                class="pos-select-search-input"
                placeholder="Tìm kiếm..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                (click)="$event.stopPropagation()"
              />
            </div>
          }

          <ul class="pos-select-options" role="listbox">
            @for (opt of filteredOptions(); track opt.value) {
              <li
                class="pos-select-option"
                [class.pos-select-option--selected]="opt.value === selectedValue()"
                [class.pos-select-option--disabled]="opt.disabled"
                role="option"
                [attr.aria-selected]="opt.value === selectedValue()"
                (click)="$event.stopPropagation(); selectOption(opt)"
              >
                @if (opt.icon) {
                  <span class="material-icons opt-icon">{{ opt.icon }}</span>
                }
                <span class="opt-label">{{ opt.label }}</span>
                @if (opt.badge) {
                  <span class="opt-badge">{{ opt.badge }}</span>
                }
                @if (opt.value === selectedValue()) {
                  <span class="opt-check">✓</span>
                }
              </li>
            } @empty {
              <li class="pos-select-no-data">
                Không tìm thấy dữ liệu
              </li>
            }
          </ul>
        </div>
      }

      @if (error) {
        <span class="pos-select-error">{{ error }}</span>
      }
      @if (hint && !error) {
        <span class="pos-select-hint">{{ hint }}</span>
      }
    </div>
  `,
  styleUrl: './pos-select.component.scss',
})
export class PosSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() selectId = '';
  @Input() placeholder = 'Chọn...';
  @Input() required = false;
  @Input() clearable = false;
  @Input() searchable = false;
  @Input() error = '';
  @Input() hint = '';
  @Input() options: SelectOption[] = [];

  @Output() selectionChange = new EventEmitter<unknown>();

  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedValue = signal<unknown>(null);
  isDisabled = false;

  private onChange: (v: unknown) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  });

  selectedOption = computed(() => {
    const val = this.selectedValue();
    return this.options.find(o => o.value === val) ?? null;
  });

  writeValue(val: unknown): void {
    this.selectedValue.set(val);
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleOpen(): void {
    if (this.isDisabled) return;
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      this.onTouched();
    } else {
      this.searchQuery.set('');
    }
  }

  close(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  selectOption(opt: SelectOption): void {
    if (opt.disabled) return;
    this.selectedValue.set(opt.value);
    this.onChange(opt.value);
    this.selectionChange.emit(opt.value);
    this.close();
  }

  clear(): void {
    this.selectedValue.set(null);
    this.onChange(null);
    this.selectionChange.emit(null);
  }
}
