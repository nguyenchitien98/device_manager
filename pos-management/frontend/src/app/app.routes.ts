import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

/**
 * Routing chính của POS Management Application.
 *
 * Tất cả routes sử dụng Standalone Components và lazy loading.
 *
 * Route tree:
 * - /login       → LoginComponent (public, noAuthGuard)
 * - /            → MainLayoutComponent (protected, authGuard)
 *    - /dashboard → DashboardComponent
 * - /**          → Wildcard redirect to /
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Đăng Nhập — POS Management',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — POS Management',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
