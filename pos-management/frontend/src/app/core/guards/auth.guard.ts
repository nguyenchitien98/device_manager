import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard bảo vệ routes yêu cầu đăng nhập.
 * Nếu chưa đăng nhập → redirect /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Guard ngăn user đã đăng nhập truy cập trang login.
 * Nếu đã đăng nhập → redirect về dashboard.
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

/**
 * Guard kiểm tra permission cụ thể.
 * Dùng với route data: { permission: 'DEVICE_ASSIGN' }
 */
export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredPermission = route.data['permission'] as string;

  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree(['/403']);
};
