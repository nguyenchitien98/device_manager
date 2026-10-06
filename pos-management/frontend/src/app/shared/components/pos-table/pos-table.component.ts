import {
  ChangeDetectionStrategy, Component, ContentChild, TemplateRef,
  Input, Output, EventEmitter, signal, computed, ElementRef, HostListener
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
  hidden?: boolean;
}

@Component({
  selector: 'pos-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PosSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="pos-table-wrap">
      @if (tableTitle || enableColumnSelector) {
        <div class="table-header-bar d-flex justify-content-between align-items-center mb-3">
          <div class="table-title font-bold text-slate-800 dark:text-white text-base">
            {{ tableTitle }}
          </div>

          @if (enableColumnSelector) {
            <div class="column-selector-wrap position-relative">
              <button
                type="button"
                class="column-selector-btn d-flex align-items-center gap-2 shadow-sm"
                (click)="toggleSelectorOpen()"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #00b050;">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>{{ visibleColumns().length }} items selected</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #64748b;">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              @if (isSelectorOpen()) {
                <div class="column-selector-dropdown shadow-lg">
                  <div class="dropdown-header font-semibold text-xs text-muted mb-2 border-bottom pb-1">
                    Hiển thị / Ẩn cột dữ liệu:
                  </div>
                  @for (col of columns; track col.field) {
                    <label class="column-checkbox-item d-flex align-items-center gap-2 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="!hiddenFields().has(col.field)"
                        (change)="toggleColumn(col.field)"
                      />
                      <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ col.header }}</span>
                    </label>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <div class="pos-table-container">
        <table class="pos-table">
          <thead>
            <tr>
              @for (col of visibleColumns(); track col.field) {
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
                <td [attr.colspan]="visibleColumns().length" class="p-0">
                  <pos-skeleton type="table-row" [rows]="skeletonRows" />
                </td>
              </tr>
            } @else if (!data || data.length === 0) {
              <tr>
                <td [attr.colspan]="visibleColumns().length" class="empty-cell">
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
                  @for (col of visibleColumns(); track col.field) {
                    <td
                      [class.text-center]="col.align === 'center'"
                      [class.text-right]="col.align === 'right'"
                    >
                      @if (cellTemplate) {
                        <ng-container
                          *ngTemplateOutlet="cellTemplate; context: { $implicit: row, column: col, index: $index }"
                        ></ng-container>
                      } @else {
                        {{ $any(row)[col.field] }}
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
export class PosTableComponent<T = any> {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() skeletonRows = 5;
  @Input() emptyTitle = 'Không tìm thấy dữ liệu';
  @Input() emptyMessage = 'Không có bản ghi nào phù hợp với bộ lọc.';
  @Input() sortField = '';
  @Input() sortOrder: 'asc' | 'desc' = 'asc';
  @Input() tableTitle = '';
  @Input() enableColumnSelector = true;

  @Output() sortChange = new EventEmitter<{ field: string; order: 'asc' | 'desc' }>();

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<{ $implicit: T; column: TableColumn; index: number }>;

  isSelectorOpen = signal(false);
  hiddenFields = signal<Set<string>>(new Set());

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isSelectorOpen.set(false);
    }
  }

  visibleColumns = computed(() => {
    const hidden = this.hiddenFields();
    return this.columns.filter(c => !hidden.has(c.field));
  });

  toggleSelectorOpen(): void {
    this.isSelectorOpen.update(v => !v);
  }

  toggleColumn(field: string): void {
    this.hiddenFields.update(set => {
      const next = new Set(set);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }

  onSort(field: string): void {
    const order = this.sortField === field && this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field, order });
  }
}
