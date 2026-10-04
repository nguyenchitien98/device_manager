import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * JWT Interceptor — Functional interceptor của Angular 22.
 *
 * Tại sao dùng Functional Interceptor thay vì Class? Angular 16+ khuyến khích
 * functional interceptors — nhẹ hơn, không cần inject DI class, tree-shakeable.
 *
 * Chức năng:
 * 1. Inject Authorization: Bearer {token} vào mọi request
 * 2. Nếu nhận 401 → tự động gọi refresh token
 * 3. Nếu refresh thất bại → logout và redirect login
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Bỏ qua: public endpoints không cần token
  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
          authService.clearAuthStateAndRedirect();
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          switchMap((response) => {
            const newToken = response.data.accessToken;
            return next(addToken(req, newToken));
          }),
          catchError((refreshError) => {
            authService.clearAuthStateAndRedirect();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout');
}

function isPublicEndpoint(url: string): boolean {
  const publicPaths = ['/auth/login', '/auth/refresh', '/auth/logout', '/health'];
  return publicPaths.some(path => url.includes(path));
}
