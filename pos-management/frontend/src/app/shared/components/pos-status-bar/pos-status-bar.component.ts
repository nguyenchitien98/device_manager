import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusCardItem {
  id: string;
  label: string;
  count: number;
  variant?: 'slate' | 'emerald' | 'blue' | 'cyan' | 'amber' | 'violet' | 'yellow' | 'rose';
  icon?: string;
}

@Component({
  selector: 'pos-status-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="pos-status-bar-grid">
      @for (card of items; track card.id) {
        <div
          class="status-card"
          [class.active]="selectedStatus === card.id"
          [class]="'card-variant-' + (card.variant || 'slate')"
          (click)="onSelect(card.id)"
        >
          <div class="card-top">
            <div class="card-label-wrap">
              @if (card.icon) {
                <i [class]="'bi ' + card.icon + ' card-icon'"></i>
              }
              <span class="card-label">{{ card.label }}</span>
            </div>
          </div>
          <div class="card-count">{{ card.count | number }}</div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./pos-status-bar.component.scss']
})
export class PosStatusBarComponent {
  @Input() items: StatusCardItem[] = [];
  @Input() selectedStatus = 'TOTAL';
  @Output() statusSelect = new EventEmitter<string>();

  onSelect(id: string) {
    this.statusSelect.emit(id);
  }
}
