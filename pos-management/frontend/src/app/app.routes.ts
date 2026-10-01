import { Routes } from '@angular/router';

/**
 * Routing chính của POS Management Application.
 *
 * Tất cả routes dùng lazy loading để giảm bundle size ban đầu.
 * AuthGuard (Sprint 01) sẽ bảo vệ các routes cần đăng nhập.
 *
 * Cấu trúc routes:
 * - /login      → AuthLoginComponent (public)
 * - /           → MainLayoutComponent (protected, lazy)
 *   - /dashboard → DashboardComponent
 *   - /inventory → InventoryModule (lazy)
 *   - /merchants → MerchantModule (lazy)
 *   - /devices   → DeviceModule (lazy)
 *   - /assignments → AssignmentModule (lazy)
 *   - /approvals → ApprovalModule (lazy)
 *   - /admin     → AdminModule (lazy, SUPER_ADMIN only)
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Đăng Nhập — POS Management',
  },
  {
    path: '',
    // MainLayoutComponent sẽ được tạo ở Sprint 01
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — POS Management',
    // canActivate: [authGuard], // Sẽ thêm ở Sprint 01
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
