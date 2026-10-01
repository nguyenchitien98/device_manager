import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Placeholder Login Component — Sprint 00.
 *
 * Sẽ được thay thế bằng Login form đầy đủ ở Sprint 01
 * với Reactive Forms, validation, JWT integration.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo">🏦</div>
        <h1>POS Management</h1>
        <p>Trang đăng nhập — Sẽ hoàn chỉnh ở Sprint 01</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-primary);
    }

    .login-card {
      text-align: center;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 48px;
      max-width: 400px;
      width: 90%;
    }

    .logo { font-size: 48px; margin-bottom: 16px; }
    h1 { color: var(--color-text-primary); margin-bottom: 8px; }
    p { color: var(--color-text-muted); font-size: 13px; }
  `],
})
export class LoginComponent {}
