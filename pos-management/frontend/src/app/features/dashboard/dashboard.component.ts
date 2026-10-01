import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dashboard Component — Trang tổng quan Hệ thống POS Management (Sprint 01 Completed).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tổng Quan Hệ Thống</h1>
          <p class="page-subtitle">Quản lý toàn bộ vòng đời thiết bị POS, Merchant và luồng phê duyệt Banking Enterprise.</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh">
            <span class="material-icons">refresh</span>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card primary">
          <div class="metric-icon">
            <span class="material-icons">devices</span>
          </div>
          <div class="metric-info">
            <span class="metric-label">Tổng Thiết Bị POS</span>
            <span class="metric-value">1,248</span>
            <span class="metric-trend positive">↑ +12% tháng này</span>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="metric-info">
            <span class="metric-label">Đang Hoạt Động</span>
            <span class="metric-value">982</span>
            <span class="metric-sub">78.6% tỷ lệ vận hành</span>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">
            <span class="material-icons">pending_actions</span>
          </div>
          <div class="metric-info">
            <span class="metric-label">Yêu Cầu Chờ Duyệt</span>
            <span class="metric-value">14</span>
            <span class="metric-sub">3 ưu tiên cao</span>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-icon">
            <span class="material-icons">storefront</span>
          </div>
          <div class="metric-info">
            <span class="metric-label">Merchant Hoạt Động</span>
            <span class="metric-value">456</span>
            <span class="metric-trend positive">↑ +8 Merchant mới</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Activities Grid -->
      <div class="dashboard-content-grid">
        <div class="card recent-activity">
          <div class="card-header">
            <h3>Nhật Ký Hoạt Động Gần Đây</h3>
            <span class="badge">Realtime Audit</span>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <span class="activity-dot success"></span>
              <div class="activity-details">
                <span class="activity-title">Phê duyệt cấp phát POS #POS-99823</span>
                <span class="activity-meta">Bởi: Nguyen Van A (Chi nhánh Hà Nội) • 10 phút trước</span>
              </div>
            </div>
            <div class="activity-item">
              <span class="activity-dot warning"></span>
              <div class="activity-details">
                <span class="activity-title">Tạo yêu cầu nhập kho 50 thiết Bị Ingenico Axium</span>
                <span class="activity-meta">Bởi: Tran Thi B (Kho Trung Tâm) • 35 phút trước</span>
              </div>
            </div>
            <div class="activity-item">
              <span class="activity-dot primary"></span>
              <div class="activity-details">
                <span class="activity-title">Tạo mới Merchant "Highlands Coffee - Hoàn Kiếm"</span>
                <span class="activity-meta">Bởi: Le Van C (Sale Officer) • 2 giờ trước</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card status-overview">
          <div class="card-header">
            <h3>Trạng Thái Sprint 01</h3>
            <span class="badge success">Hoàn Thành</span>
          </div>
          <div class="sprint-status-list">
            <div class="status-row">
              <span class="material-icons check">check_circle</span>
              <span>JWT Authentication & Dual Token (Access/Refresh)</span>
            </div>
            <div class="status-row">
              <span class="material-icons check">check_circle</span>
              <span>Fine-grained RBAC Authorization (10 Permissions)</span>
            </div>
            <div class="status-row">
              <span class="material-icons check">check_circle</span>
              <span>Admin Shell Layout (Header + Responsive Sidebar)</span>
            </div>
            <div class="status-row">
              <span class="material-icons check">check_circle</span>
              <span>Angular Signals State & Functional Interceptors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px 0;
      }

      .page-subtitle {
        font-size: 13px;
        color: #64748b;
        margin: 0;
      }

      .btn-refresh {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #334155;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .material-icons {
          font-size: 18px;
        }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);

      .metric-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .material-icons {
          font-size: 24px;
        }
      }

      &.primary {
        .metric-icon { background: #eff6ff; color: #2563eb; }
      }
      &.success {
        .metric-icon { background: #f0fdf4; color: #16a34a; }
      }
      &.warning {
        .metric-icon { background: #fffbeb; color: #d97706; }
      }
      &.info {
        .metric-icon { background: #f5f3ff; color: #7c3aed; }
      }

      .metric-info {
        display: flex;
        flex-direction: column;

        .metric-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 2px 0;
        }

        .metric-trend {
          font-size: 11px;
          font-weight: 600;
          &.positive { color: #16a34a; }
        }

        .metric-sub {
          font-size: 11px;
          color: #94a3b8;
        }
      }
    }

    .dashboard-content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;

      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;

        h3 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;

          &.success {
            background: #dcfce7;
            color: #15803d;
          }
        }
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .activity-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;

          &.success { background: #22c55e; }
          &.warning { background: #f59e0b; }
          &.primary { background: #3b82f6; }
        }

        .activity-details {
          display: flex;
          flex-direction: column;

          .activity-title {
            font-size: 13px;
            font-weight: 500;
            color: #1e293b;
          }

          .activity-meta {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 2px;
          }
        }
      }
    }

    .sprint-status-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .status-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: #334155;

        .material-icons.check {
          color: #16a34a;
          font-size: 18px;
        }
      }
    }
  `]
})
export class DashboardComponent {}
