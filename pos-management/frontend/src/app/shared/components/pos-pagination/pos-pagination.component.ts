import {
  ChangeDetectionStrategy, Component, Input, Output,
  EventEmitter, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PosPaginationComponent — Component Phân trang dùng chung cho mọi bảng dữ liệu.
 *
 * ## Sử dụng:
 * ```html
 * <pos-pagination
 *   [totalItems]="totalRecords"
 *   [pageSize]="pageSize"
 *   [currentPage]="currentPage"
 *   (pageChange)="onPageChange($event)"
 *   (pageSizeChange)="onPageSizeChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'pos-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="pos-pagination">
      <!-- Information -->
      <div class="pos-pagination-info">
        Hiển thị <strong>{{ startItem }}</strong> - <strong>{{ endItem }}</strong> / <strong>{{ totalItems }}</strong> kết quả
      </div>

      <div class="pos-pagination-controls">
        <!-- Page size selector -->
        @if (showPageSizeOptions) {
          <div class="pos-pagination-size-select">
            <span>Hiển thị:</span>
            <select
              [value]="pageSize"
              (change)="onSizeSelect($event)"
              class="pos-pagination-select"
            >
              @for (size of pageSizeOptions; track size) {
                <option [value]="size">{{ size }} dòng</option>
              }
            </select>
          </div>
        }

        <!-- Page buttons -->
        <div class="pos-pagination-pages">
          <button
            type="button"
            class="pos-pagination-btn"
            [disabled]="currentPage <= 1"
            (click)="goToPage(currentPage - 1)"
            aria-label="Trang trước"
          >
            ‹
          </button>

          @for (p of pages; track $index) {
            @if (p === -1) {
              <span class="pos-pagination-dots">...</span>
            } @else {
              <button
                type="button"
                class="pos-pagination-btn"
                [class.pos-pagination-btn--active]="p === currentPage"
                (click)="goToPage(p)"
              >
                {{ p }}
              </button>
            }
          }

          <button
            type="button"
            class="pos-pagination-btn"
            [disabled]="currentPage >= totalPages"
            (click)="goToPage(currentPage + 1)"
            aria-label="Trang sau"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './pos-pagination.component.scss'
})
export class PosPaginationComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() showPageSizeOptions = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const items: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push(i);
    } else {
      items.push(1);
      if (current > 3) items.push(-1); // -1 renders as '...'

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) items.push(i);

      if (current < total - 2) items.push(-1);
      items.push(total);
    }
    return items;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onSizeSelect(event: Event): void {
    const newSize = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(newSize);
    this.pageChange.emit(1);
  }
}
