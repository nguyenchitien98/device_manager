import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';


/** KPI Card (Gradient) */
interface KpiCard {
  labelKey: string;
  value: number;
  icon: string;       // SVG path string
  colorClass: string; // kpi-blue, kpi-green, etc.
}

/** Secondary stat card */
interface StatCard {
  labelKey: string;
  value: number;
  iconColor: string;
  icon: string;
}

/** Monthly bar data */
interface MonthlyData {
  month: string;
  import: number;
  export: number;
}

/** Warehouse data */
interface WarehouseData {
  name: string;
  value: number;
  max: number;
}

/** Activity item */
interface ActivityItem {
  author: string;
  role: string;
  desc: string;
  time: string;
  initials: string;
  color: string;
}

/** Donut slice */
interface DonutSlice {
  labelKey: string;
  color: string;
  count: number;
  percent: number;
  dasharray: string;
  dashoffset: string;
}

/**
 * Dashboard Component — Pixel-perfect replica từ ảnh chuẩn.
 * Dual Theme: Light + Dark qua CSS variables.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  // ─── KPI Row 1: 5 Gradient Cards ────────────────────────────────
  readonly kpiCards: KpiCard[] = [
    {
      labelKey: 'DASHBOARD.TOTAL_DEVICES',
      value: 1245,
      colorClass: 'kpi-blue',
      icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
    },
    {
      labelKey: 'NAV.STOCK',
      value: 423,
      colorClass: 'kpi-green',
      icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
    },
    {
      labelKey: 'DASHBOARD.ACTIVE_DEVICES',
      value: 756,
      colorClass: 'kpi-indigo',
      icon: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M9 12h6 M12 9v6',
    },
    {
      labelKey: 'STOCK.FAULTY',
      value: 42,
      colorClass: 'kpi-amber',
      icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    },
    {
      labelKey: 'COMMON.CANCELLED',
      value: 24,
      colorClass: 'kpi-red',
      icon: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    },
  ];

  // ─── KPI Row 2: 3 Secondary Stats ───────────────────────────────
  readonly statCards: StatCard[] = [
    {
      labelKey: 'DASHBOARD.TOTAL_MERCHANTS',
      value: 238,
      iconColor: '#1976D2',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    },
    {
      labelKey: 'NAV.TERMINALS',
      value: 892,
      iconColor: '#059669',
      icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M2 10h20',
    },
    {
      labelKey: 'DASHBOARD.PENDING_APPROVALS',
      value: 8,
      iconColor: '#D97706',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
    },
  ];

  // ─── Monthly Data for Bar Chart ──────────────────────────────────
  readonly monthlyData: MonthlyData[] = [
    { month: 'Jan', import: 85,  export: 45 },
    { month: 'Feb', import: 92,  export: 52 },
    { month: 'Mar', import: 112, export: 78 },
    { month: 'Apr', import: 88,  export: 64 },
    { month: 'May', import: 68,  export: 48 },
    { month: 'Jun', import: 90,  export: 76 },
    { month: 'Jul', import: 82,  export: 58 },
    { month: 'Aug', import: 98,  export: 68 },
    { month: 'Sep', import: 88,  export: 58 },
    { month: 'Okt', import: 104, export: 72 },
    { month: 'Nov', import: 100, export: 66 },
    { month: 'Dic', import: 86,  export: 60 },
  ];

  readonly chartMax = 120; // max value for bar scaling

  // ─── Donut Chart ─────────────────────────────────────────────────
  readonly donutSlices: DonutSlice[] = this.buildDonut([
    { labelKey: 'DASHBOARD.TOTAL_DEVICES',   color: '#1976D2', count: 1245 },
    { labelKey: 'DASHBOARD.ACTIVE_DEVICES', color: '#059669', count: 756 },
    { labelKey: 'STOCK.FAULTY',  color: '#F57C00', count: 42 },
    { labelKey: 'COMMON.CANCELLED',        color: '#D32F2F', count: 24 },
  ]);

  private buildDonut(items: { labelKey: string; color: string; count: number }[]): DonutSlice[] {
    const total  = items.reduce((s, i) => s + i.count, 0);
    const r      = 54;
    const circ   = 2 * Math.PI * r;
    let offset   = 0;
    return items.map(item => {
      const pct = item.count / total;
      const da  = pct * circ;
      const slice: DonutSlice = {
        ...item,
        percent: Math.round(pct * 100),
        dasharray: `${da.toFixed(2)} ${(circ - da).toFixed(2)}`,
        dashoffset: (-offset).toFixed(2),
      };
      offset += da;
      return slice;
    });
  }

  // ─── Top Warehouses (Horizontal Bar) ─────────────────────────────
  readonly topWarehouses: WarehouseData[] = [
    { name: 'Kho tổ kho',   value: 280, max: 300 },
    { name: 'Kho tỉnh 5',   value: 220, max: 300 },
    { name: 'Kho (brv-tt)', value: 175, max: 300 },
    { name: 'Kho tỉnh 5',   value: 140, max: 300 },
    { name: 'Kho tồn nhỏ',  value: 90,  max: 300 },
  ];

  readonly whXAxis = [0, 50, 100, 150, 200, 250, 300];

  // ─── Activity Feed ───────────────────────────────────────────────
  readonly recentActivities: ActivityItem[] = [
    {
      author: 'Admin User',
      role: 'SUPER_ADMIN',
      desc: 'Đã xem Merchant.',
      time: '20 minutes ago',
      initials: 'AU',
      color: '#1976D2',
    },
    {
      author: 'Admin User',
      role: 'SUPER_ADMIN',
      desc: 'Đăng kí thiết bị.',
      time: '20 minutes ago',
      initials: 'AU',
      color: '#1976D2',
    },
    {
      author: 'Admin User',
      role: 'SUPER_ADMIN',
      desc: 'Tạo assignment mới.',
      time: '20 minutes ago',
      initials: 'AU',
      color: '#1976D2',
    },
  ];

  ngOnInit(): void {
    // Data sẽ load từ API khi backend ready.
    // Hiện tại dùng mock data trên để preview UI.
  }

  /** Scale bar height theo max value */
  barHeight(value: number): number {
    return (value / this.chartMax) * 100;
  }

  /** Scale horizontal bar width */
  barWidth(value: number, max: number): number {
    return (value / max) * 100;
  }
}
