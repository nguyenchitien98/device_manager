import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dashboard Component — Pixel-perfect replica của pos_dashboard_main_1790867196500.png & docs/07_UI_UX_Standard.md
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <h1 class="page-title">Dashboard</h1>

      <!-- ─── Row 1: 5 Colored Metric Cards ───────────────────────── -->
      <div class="metrics-row-5">
        <!-- Card 1: Tổng thiết bị -->
        <div class="metric-card card-blue">
          <div class="card-icon-box">
            <span class="material-icons">smartphone</span>
          </div>
          <div class="card-content">
            <span class="card-label">Tổng thiết bị</span>
            <span class="card-value">1,245</span>
          </div>
        </div>

        <!-- Card 2: Tồn kho -->
        <div class="metric-card card-green">
          <div class="card-icon-box">
            <span class="material-icons">inventory_2</span>
          </div>
          <div class="card-content">
            <span class="card-label">Tồn kho</span>
            <span class="card-value">423</span>
          </div>
        </div>

        <!-- Card 3: Đang triển khai -->
        <div class="metric-card card-purple">
          <div class="card-icon-box">
            <span class="material-icons">point_of_sale</span>
          </div>
          <div class="card-content">
            <span class="card-label">Đang triển khai</span>
            <span class="card-value">756</span>
          </div>
        </div>

        <!-- Card 4: Đang sửa chữa -->
        <div class="metric-card card-orange">
          <div class="card-icon-box">
            <span class="material-icons">build</span>
          </div>
          <div class="card-content">
            <span class="card-label">Đang sửa chữa</span>
            <span class="card-value">42</span>
          </div>
        </div>

        <!-- Card 5: Thanh lý -->
        <div class="metric-card card-red">
          <div class="card-icon-box">
            <span class="material-icons">delete</span>
          </div>
          <div class="card-content">
            <span class="card-label">Thanh lý</span>
            <span class="card-value">24</span>
          </div>
        </div>
      </div>

      <!-- ─── Row 2: 3 Secondary Stats Cards ─────────────────────── -->
      <div class="metrics-row-3">
        <div class="stat-card">
          <span class="stat-label">Merchant Active</span>
          <span class="stat-value">238</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Tổng TID</span>
          <span class="stat-value">892</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Chờ phê duyệt</span>
          <span class="stat-value">8</span>
        </div>
      </div>

      <!-- ─── Row 3: Main Charts (Bar + Donut) ────────────────────── -->
      <div class="charts-row">
        <!-- Monthly Inventory Movement Bar Chart -->
        <div class="panel-card chart-panel-large">
          <div class="panel-header">
            <h3>Nhập/Xuất kho theo tháng</h3>
          </div>
          <div class="bar-chart-container">
            <div class="chart-y-axis">
              <span>120</span>
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <div class="chart-bars-area">
              <div class="month-column" *ngFor="let m of monthlyData">
                <div class="bars-pair">
                  <div class="bar bar-import" [style.height.%]="(m.import / 120) * 100" [title]="'Nhập: ' + m.import"></div>
                  <div class="bar bar-export" [style.height.%]="(m.export / 120) * 100" [title]="'Xuất: ' + m.export"></div>
                </div>
                <span class="month-label">{{ m.month }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Status Distribution Donut Chart -->
        <div class="panel-card chart-panel-small">
          <div class="panel-header">
            <h3>Phân bổ thiết bị theo trạng thái</h3>
          </div>
          <div class="donut-chart-wrapper">
            <svg viewBox="0 0 160 160" class="donut-svg">
              <!-- Segment 1: Blue (Tổng thiết bị) 40% -->
              <circle cx="80" cy="80" r="55" fill="none" stroke="#2563eb" stroke-width="24"
                      stroke-dasharray="138 208" stroke-dashoffset="0" />
              <!-- Segment 2: Teal/Green (Đang triển khai) 35% -->
              <circle cx="80" cy="80" r="55" fill="none" stroke="#10b981" stroke-width="24"
                      stroke-dasharray="121 225" stroke-dashoffset="-138" />
              <!-- Segment 3: Orange (Đang sửa chữa) 15% -->
              <circle cx="80" cy="80" r="55" fill="none" stroke="#f59e0b" stroke-width="24"
                      stroke-dasharray="52 294" stroke-dashoffset="-259" />
              <!-- Segment 4: Red (Thanh lý) 10% -->
              <circle cx="80" cy="80" r="55" fill="none" stroke="#ef4444" stroke-width="24"
                      stroke-dasharray="35 311" stroke-dashoffset="-311" />
            </svg>
            <div class="donut-center-hole"></div>
          </div>
          <div class="donut-legend">
            <div class="legend-item"><span class="dot blue"></span><span>Tổng thiết bị</span></div>
            <div class="legend-item"><span class="dot teal"></span><span>Đang triển khai</span></div>
            <div class="legend-item"><span class="dot orange"></span><span>Đang sửa chữa</span></div>
            <div class="legend-item"><span class="dot red"></span><span>Thanh lý</span></div>
          </div>
        </div>
      </div>

      <!-- ─── Row 4: Top Warehouses & Recent Activity ─────────────── -->
      <div class="charts-row">
        <!-- Top 5 Warehouses Horizontal Bar Chart -->
        <div class="panel-card chart-panel-large">
          <div class="panel-header">
            <h3>Top 5 Kho tồn nhiều nhất</h3>
          </div>
          <div class="horizontal-bars-container">
            <div class="hbar-item" *ngFor="let wh of topWarehouses">
              <span class="wh-name">{{ wh.name }}</span>
              <div class="hbar-track">
                <div class="hbar-fill bar-import" [style.width.%]="(wh.val1 / 300) * 100"></div>
                <div class="hbar-fill bar-export" [style.width.%]="(wh.val2 / 300) * 100"></div>
              </div>
            </div>
            <div class="hbar-x-axis">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>250</span>
              <span>300</span>
            </div>
          </div>
        </div>

        <!-- Recent Activities Feed -->
        <div class="panel-card chart-panel-small">
          <div class="panel-header">
            <h3>Hoạt động gần đây</h3>
          </div>
          <div class="activity-feed">
            <div class="activity-row" *ngFor="let act of recentActivities">
              <div class="act-avatar">
                <img [src]="act.avatar" alt="Avatar" />
              </div>
              <div class="act-body">
                <span class="act-author">{{ act.author }} | <small>{{ act.role }}</small></span>
                <span class="act-desc">{{ act.desc }}</span>
                <span class="act-time">{{ act.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    /* ─── Row 1: 5 Colored Metric Cards ───────────────────────── */
    .metrics-row-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .metric-card {
      background: #0f192e;
      border: 1px solid #1c2b48;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .card-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;

        .material-icons {
          font-size: 22px;
        }
      }

      .card-content {
        display: flex;
        flex-direction: column;

        .card-label {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin-top: 2px;
        }
      }

      &.card-blue {
        border-color: rgba(37, 99, 235, 0.4);
        box-shadow: 0 0 16px rgba(37, 99, 235, 0.15);
        .card-icon-box { background: #2563eb; }
      }
      &.card-green {
        border-color: rgba(16, 185, 129, 0.4);
        .card-icon-box { background: #059669; }
      }
      &.card-purple {
        border-color: rgba(124, 58, 237, 0.4);
        .card-icon-box { background: #7c3aed; }
      }
      &.card-orange {
        border-color: rgba(217, 119, 6, 0.4);
        .card-icon-box { background: #d97706; }
      }
      &.card-red {
        border-color: rgba(220, 38, 38, 0.4);
        .card-icon-box { background: #dc2626; }
      }
    }

    /* ─── Row 2: 3 Secondary Stats Cards ─────────────────────── */
    .metrics-row-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: #0f192e;
      border: 1px solid #1c2b48;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;

      .stat-label {
        font-size: 13px;
        color: #94a3b8;
        font-weight: 500;
      }

      .stat-value {
        font-size: 26px;
        font-weight: 700;
        color: #ffffff;
        margin-top: 4px;
      }
    }

    /* ─── Charts Layout ───────────────────────────────────────── */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;

      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }

    .panel-card {
      background: #0f192e;
      border: 1px solid #1c2b48;
      border-radius: 12px;
      padding: 20px;

      .panel-header {
        margin-bottom: 16px;

        h3 {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }
      }
    }

    /* ─── Bar Chart (Monthly Movement) ────────────────────────── */
    .bar-chart-container {
      display: flex;
      gap: 12px;
      height: 220px;
      padding-top: 10px;

      .chart-y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-size: 11px;
        color: #64748b;
        padding-right: 8px;

        span {
          height: 0;
          display: flex;
          align-items: center;
        }
      }

      .chart-bars-area {
        flex: 1;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        border-bottom: 1px solid #1e293b;
        border-left: 1px solid #1e293b;
        padding: 0 8px 4px 8px;

        .month-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
          height: 100%;

          .bars-pair {
            flex: 1;
            display: flex;
            align-items: flex-end;
            gap: 3px;

            .bar {
              width: 8px;
              border-radius: 3px 3px 0 0;
              transition: height 0.3s ease;

              &.bar-import { background: #2563eb; }
              &.bar-export { background: #10b981; }
            }
          }

          .month-label {
            font-size: 10.5px;
            color: #64748b;
          }
        }
      }
    }

    /* ─── Donut Chart (Device Distribution) ────────────────────── */
    .donut-chart-wrapper {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 10px auto 16px auto;

      .donut-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .donut-center-hole {
        position: absolute;
        inset: 26px;
        background: #0f192e;
        border-radius: 50%;
      }
    }

    .donut-legend {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 11px;
      color: #94a3b8;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.blue { background: #2563eb; }
          &.teal { background: #10b981; }
          &.orange { background: #f59e0b; }
          &.red { background: #ef4444; }
        }
      }
    }

    /* ─── Horizontal Bar Chart (Top 5 Warehouses) ──────────────── */
    .horizontal-bars-container {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .hbar-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .wh-name {
          font-size: 12px;
          color: #cbd5e1;
        }

        .hbar-track {
          height: 14px;
          background: #1e293b;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          gap: 2px;

          .hbar-fill {
            height: 100%;
            border-radius: 4px;

            &.bar-import { background: #2563eb; }
            &.bar-export { background: #10b981; }
          }
        }
      }

      .hbar-x-axis {
        display: flex;
        justify-content: space-between;
        font-size: 10.5px;
        color: #64748b;
        margin-top: 4px;
        border-top: 1px dashed #1e293b;
        padding-top: 4px;
      }
    }

    /* ─── Recent Activities Feed ─────────────────────────────── */
    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .activity-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;

        .act-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #1e293b;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .act-body {
          display: flex;
          flex-direction: column;

          .act-author {
            font-size: 12px;
            font-weight: 600;
            color: #ffffff;

            small {
              color: #64748b;
              font-weight: 400;
            }
          }

          .act-desc {
            font-size: 11.5px;
            color: #94a3b8;
            margin-top: 1px;
          }

          .act-time {
            font-size: 10.5px;
            color: #64748b;
            margin-top: 2px;
          }
        }
      }
    }
  `]
})
export class DashboardComponent {
  monthlyData = [
    { month: 'Jan', import: 85, export: 45 },
    { month: 'Feb', import: 92, export: 52 },
    { month: 'Mar', import: 112, export: 78 },
    { month: 'Apr', import: 88, export: 64 },
    { month: 'May', import: 68, export: 48 },
    { month: 'Jun', import: 90, export: 76 },
    { month: 'Jul', import: 82, export: 58 },
    { month: 'Aug', import: 98, export: 68 },
    { month: 'Sep', import: 88, export: 58 },
    { month: 'Oct', import: 104, export: 72 },
    { month: 'Nov', import: 100, export: 66 },
    { month: 'Dic', import: 86, export: 60 },
  ];

  topWarehouses = [
    { name: 'Kho trung tâm', val1: 220, val2: 50 },
    { name: 'Kho miền Nam', val1: 180, val2: 40 },
    { name: 'Kho miền Bắc', val1: 150, val2: 30 },
    { name: 'Kho miền Trung', val1: 120, val2: 25 },
    { name: 'Kho tồn nhỏ', val1: 90, val2: 20 },
  ];

  recentActivities = [
    {
      author: 'Admin User',
      role: 'SUPER_ADMIN',
      desc: 'exised Merchant.',
      time: '20 minutes ago',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    },
    {
      author: 'Admin User',
      role: 'SUPER_ADMIN',
      desc: 'activity detail.',
      time: '20 minutes ago',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    },
    {
      author: 'Admin User',
      role: 'SUPER_ADMIN',
      desc: 'activates key.',
      time: '20 minutes ago',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    }
  ];
}
