import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

import { AuthService } from '../services/auth.service';

export interface ApiErrorPayload {
  errorCode?: string;
  message?: string;
  details?: Record<string, string>;
  path?: string;
  timestamp?: string;
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Đã xảy ra lỗi không xác định.';
      let errorTitle = 'Lỗi hệ thống';

      if (error.error && typeof error.error === 'object') {
        const payload = error.error as ApiErrorPayload;
        if (payload.message) {
          errorMessage = payload.errorCode ? `[${payload.errorCode}] ${payload.message}` : payload.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      switch (error.status) {
        case 400:
          errorTitle = 'Dữ liệu không hợp lệ';
          toastService.error(errorMessage, errorTitle);
          break;

        case 401:
          if (!req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
            toastService.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Hết phiên làm việc');
            authService.clearAuthStateAndRedirect();
          }
          break;

        case 403:
          errorTitle = 'Truy cập bị từ chối';
          toastService.error('Bạn không có quyền thực hiện thao tác này.', errorTitle);
          break;

        case 404:
          errorTitle = 'Không tìm thấy dữ liệu';
          toastService.warning(errorMessage || 'Tài nguyên yêu cầu không tồn tại.', errorTitle);
          break;

        case 409:
          errorTitle = 'Xung đột dữ liệu';
          toastService.error(errorMessage || 'Dữ liệu đã tồn tại hoặc bị trùng lặp.', errorTitle);
          break;

        case 500:
        case 502:
        case 503:
          errorTitle = 'Lỗi Máy Chủ';
          toastService.error(errorMessage || 'Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau.', errorTitle);
          break;

        default:
          if (error.status !== 0) {
            toastService.error(errorMessage, errorTitle);
          } else {
            toastService.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.', 'Mất kết nối');
          }
          break;
      }

      return throwError(() => error);
    })
  );
};
