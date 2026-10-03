import {
  ChangeDetectionStrategy, Component, ContentChild, TemplateRef,
  Input, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosSkeletonComponent } from '../pos-skeleton/pos-skeleton.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

/**
 * PosTableComponent — Bảng dữ liệu dùng chung toàn hệ thống POS.
 *
 * ## Sử dụng:
 * ```html
 * <pos-table
 *   [columns]="[
 *     { field: 'code', header: 'Mã Merchant', width: '140px' },
 *     { field: 'name', header: 'Tên Merchant' },
 *     { field: 'status', header: 'Trạng thái', width: '130px' },
 *     { field: 'actions', header: 'Thao tác', width: '100px', align: 'center' }
 *   ]"
 *   [data]="merchants"
 *   [loading]="loading"
 * >
 *   <ng-template #cellTemplate let-row let-col="column">
 *     @if (col.field === 'status') {
 *       <pos-badge [variant]="row.status === 'ACTIVE' ? 'success' : 'danger'">
 *         {{ row.status }}
 *       </pos-badge>
 *     } @else if (col.field === 'actions') {
 *       <pos-dropdown [items]="rowActions" (itemClick)="onAction(row, $event)" />
 *     } @else {
 *       {{ row[col.field] }}
 *     }
 *   </ng-template>
 * </pos-table>
 * ```
 */
@Component({
  selector: 'pos-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="pos-table-wrap">
      <div class="pos-table-container">
        <table class="pos-table">
          <thead>
            <tr>
              @for (col of columns; track col.field) {
                <th
                  [style.width]="col.width || 'auto'"
                  [class.text-center]="col.align === 'center'"
                  [class.text-right]="col.align === 'right'"
                  [class.sortable]="col.sortable"
                  (click)="col.sortable && onSort(col.field)"
                >
                  <div class="th-content">
                    <span>{{ col.header }}</span>
                    @if (col.sortable && sortField === col.field) {
                      <span class="sort-icon">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr>
                <td [attr.colspan]="columns.length" class="p-0">
                  <pos-skeleton type="table-row" [rows]="skeletonRows" />
                </td>
              </tr>
            } @else if (!data || data.length === 0) {
              <tr>
                <td [attr.colspan]="columns.length" class="empty-cell">
                  <app-empty-state
                    [title]="emptyTitle"
                    [message]="emptyMessage"
                    type="search"
                  />
                </td>
              </tr>
            } @else {
              @for (row of data; track $index) {
                <tr>
                  @for (col of columns; track col.field) {
                    <td
                      [class.text-center]="col.align === 'center'"
                      [class.text-right]="col.align === 'right'"
                    >
                      @if (cellTemplate) {
                        <ng-container
                          *ngTemplateOutlet="cellTemplate; context: { $implicit: row, column: col, index: $index }"
                        ></ng-container>
                      } @else {
                        {{ row[col.field] }}
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrl: './pos-table.component.scss'
})
export class PosTableComponent<T = Record<string, unknown>> {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() skeletonRows = 5;
  @Input() emptyTitle = 'Không tìm thấy dữ liệu';
  @Input() emptyMessage = 'Không có bản ghi nào phù hợp với bộ lọc.';
  @Input() sortField = '';
  @Input() sortOrder: 'asc' | 'desc' = 'asc';

  @Output() sortChange = new EventEmitter<{ field: string; order: 'asc' | 'desc' }>();

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<{ $implicit: T; column: TableColumn; index: number }>;

  onSort(field: string): void {
    const order = this.sortField === field && this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field, order });
  }
}
