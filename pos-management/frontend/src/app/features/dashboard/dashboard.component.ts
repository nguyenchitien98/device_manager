import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Placeholder Dashboard Component — Sprint 00.
 *
 * Component tạm thời để project compile được ở Sprint 00.
 * Sẽ được thay thế bằng Dashboard thực ở Sprint 13.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-card">
        <div class="logo">🏦</div>
        <h1>POS Management System</h1>
        <p class="subtitle">Sprint 00 — Infrastructure Ready</p>
        <div class="status-grid">
          <div class="status-item success">
            <span class="icon">✅</span>
            <span>Backend Structure</span>
          </div>
          <div class="status-item success">
            <span class="icon">✅</span>
            <span>Docker Compose</span>
          </div>
          <div class="status-item success">
            <span class="icon">✅</span>
            <span>Angular 22 Setup</span>
          </div>
          <div class="status-item pending">
            <span class="icon">🔄</span>
            <span>Sprint 01: Auth & RBAC</span>
          </div>
        </div>
        <a class="btn-link" routerLink="/login">Đi tới trang Login →</a>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-primary);
    }

    .placeholder-card {
      text-align: center;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 48px;
      max-width: 480px;
      width: 90%;
      box-shadow: var(--shadow-lg);
    }

    .logo {
      font-size: 56px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-bottom: 32px;
    }

    .status-grid {
      display: grid;
      gap: 12px;
      margin-bottom: 32px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 14px;

      &.success {
        background: rgba(16,185,129,0.1);
        color: var(--color-success);
        border: 1px solid rgba(16,185,129,0.2);
      }
      &.pending {
        background: rgba(59,130,246,0.1);
        color: var(--color-primary);
        border: 1px solid rgba(59,130,246,0.2);
      }
    }

    .btn-link {
      display: inline-block;
      padding: 12px 28px;
      background: var(--color-primary);
      color: white;
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 600;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--color-primary-hover);
        color: white;
      }
    }
  `],
})
export class DashboardComponent {}
