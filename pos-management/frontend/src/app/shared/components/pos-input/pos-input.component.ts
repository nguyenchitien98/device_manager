import {
  ChangeDetectionStrategy, Component, Input, Output,
  EventEmitter, forwardRef, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR
} from '@angular/forms';

/**
 * PosInputComponent — Input, Textarea, Search chung toàn hệ thống.
 *
 * ## Dùng:
 * ```html
 * <!-- Standalone -->
 * <pos-input label="Tên Merchant" [required]="true" [(ngModel)]="form.name"
 *            placeholder="Nhập tên..." inputId="inp-name" />
 *
 * <!-- Search with icon -->
 * <pos-input type="search" [(ngModel)]="keyword" placeholder="Tìm kiếm..." />
 * ```
 *
 * ## Quy tắc:
 * - KHÔNG tự viết <input> trong form. LUÔN dùng <pos-input>.
 * - Bắt buộc truyền inputId để automation test.
 * - Lỗi validate truyền qua [error].
 */
@Component({
  selector: 'pos-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PosInputComponent),
    multi: true,
  }],
  template: `
    <div class="pos-input-wrap" [class.pos-input-wrap--error]="error">
      @if (label) {
        <label class="pos-input-label" [attr.for]="inputId">
          {{ label }}
          @if (required) { <span class="pos-input-required" aria-label="bắt buộc">*</span> }
        </label>
      }

      <div class="pos-input-field"
           [class.pos-input-field--prefix]="!!prefixIcon"
           [class.pos-input-field--suffix]="!!suffixIcon || type === 'search'">

        @if (prefixIcon) {
          <span class="pos-input-prefix-icon" aria-hidden="true">{{ prefixIcon }}</span>
        }
        @if (type === 'search' && !prefixIcon) {
          <span class="pos-input-prefix-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
        }

        @if (type === 'textarea') {
          <textarea
            class="pos-input-ctrl"
            [id]="inputId"
            [placeholder]="placeholder"
            [disabled]="isDisabled"
            [attr.rows]="rows"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
            (blur)="onTouched()"
          ></textarea>
        } @else {
          <input
            class="pos-input-ctrl"
            [type]="type === 'search' ? 'text' : type"
            [id]="inputId"
            [placeholder]="placeholder"
            [disabled]="isDisabled"
            [ngModel]="value"
            (ngModelChange)="onValueChange($event)"
            (blur)="onTouched()"
            (keyup.enter)="enterPressed.emit($event)"
          />
        }

        @if (suffixIcon) {
          <span class="pos-input-suffix-icon" aria-hidden="true">{{ suffixIcon }}</span>
        }

        @if (clearable && value) {
          <button type="button" class="pos-input-clear" (click)="clear()" aria-label="Xoá">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }
      </div>

      @if (error) {
        <span class="pos-input-error" role="alert">{{ error }}</span>
      }
      @if (hint && !error) {
        <span class="pos-input-hint">{{ hint }}</span>
      }
    </div>
  `,
  styleUrl: './pos-input.component.scss',
})
export class PosInputComponent implements ControlValueAccessor {
  @Input() label       = '';
  @Input() inputId     = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'search' | 'textarea' | 'date' | 'datetime-local' = 'text';
  @Input() required    = false;
  @Input() clearable   = false;
  @Input() rows        = 3;
  @Input() error       = '';
  @Input() hint        = '';
  @Input() prefixIcon  = '';
  @Input() suffixIcon  = '';

  @Output() enterPressed = new EventEmitter<KeyboardEvent>();

  value     = '';
  isDisabled = false;
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void        { this.value = val ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void         { this.onTouched = fn; }
  setDisabledState(d: boolean): void   { this.isDisabled = d; }

  onValueChange(val: string): void {
    this.value = val;
    this.onChange(val);
  }

  clear(): void { this.onValueChange(''); }
}
