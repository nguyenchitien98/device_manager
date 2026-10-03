import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'line' | 'circle' | 'card' | 'table-row';

/**
 * PosSkeletonComponent — Skeleton Loading Placeholder dùng khi chờ dữ liệu API.
 *
 * ## Sử dụng:
 * ```html
 * <pos-skeleton type="table-row" [rows]="5" />
 * <pos-skeleton type="line" width="200px" height="24px" />
 * <pos-skeleton type="circle" width="48px" height="48px" />
 * ```
 */
@Component({
  selector: 'pos-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (type === 'table-row') {
      @for (r of rowsArray; track $index) {
        <div class="pos-skeleton-row">
          <div class="pos-skeleton-item pos-skeleton-circle" style="width: 32px; height: 32px;"></div>
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 25%;"></div>
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 40%;"></div>
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 15%;"></div>
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 10%;"></div>
        </div>
      }
    } @else if (type === 'card') {
      <div class="pos-skeleton-card">
        <div class="pos-skeleton-item pos-skeleton-circle" style="width: 48px; height: 48px;"></div>
        <div class="pos-skeleton-card-body">
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 60%; height: 18px;"></div>
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 90%; height: 14px; margin-top: 8px;"></div>
          <div class="pos-skeleton-item pos-skeleton-line" style="width: 40%; height: 14px; margin-top: 6px;"></div>
        </div>
      </div>
    } @else {
      @for (r of rowsArray; track $index) {
        <div
          class="pos-skeleton-item"
          [class.pos-skeleton-line]="type === 'line'"
          [class.pos-skeleton-circle]="type === 'circle'"
          [style.width]="width"
          [style.height]="height"
          [style.borderRadius]="borderRadius"
        ></div>
      }
    }
  `,
  styleUrl: './pos-skeleton.component.scss'
})
export class PosSkeletonComponent {
  @Input() type: SkeletonType = 'line';
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() borderRadius = '';
  @Input() rows = 1;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows });
  }
}
