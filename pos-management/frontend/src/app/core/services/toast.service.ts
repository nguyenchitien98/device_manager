import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: ToastType, title: string, message: string, duration = 4000): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, type, title, message, duration };

    this.toasts.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  success(message: string, title = 'Thành công', duration = 4000): string {
    return this.show('success', title, message, duration);
  }

  error(message: string, title = 'Lỗi hệ thống', duration = 5000): string {
    return this.show('error', title, message, duration);
  }

  warning(message: string, title = 'Cảnh báo', duration = 4000): string {
    return this.show('warning', title, message, duration);
  }

  info(message: string, title = 'Thông tin', duration = 4000): string {
    return this.show('info', title, message, duration);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
