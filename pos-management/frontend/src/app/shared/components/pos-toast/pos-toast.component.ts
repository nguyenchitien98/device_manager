import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-pos-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-toast.component.html',
  styleUrl: './pos-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosToastComponent {
  readonly toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  close(id: string): void {
    this.toastService.remove(id);
  }
}
