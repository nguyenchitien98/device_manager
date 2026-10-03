import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import { authReducer } from './core/store/auth/auth.reducer';
import { notificationReducer } from './core/store/notification/notification.reducer';
import { approvalReducer } from './core/store/approval/approval.reducer';

/**
 * Cấu hình Application-level providers cho POS Management Angular App.
 *
 * Tại sao dùng ApplicationConfig thay vì NgModule? Angular 22 khuyến khích
 * Standalone Component + Functional providers — không cần AppModule boilerplate.
 * ApplicationConfig cho phép lazy load và tree-shake tốt hơn.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone-based change detection với event coalescing để tối ưu performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router với lazy-loaded routes
    provideRouter(routes),

    // HTTP client — với jwtInterceptor & errorInterceptor
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),

    // Angular Material animations (async để không block first paint)
    provideAnimationsAsync(),

    // NgRx Global Store Setup
    provideStore({
      auth: authReducer,
      notification: notificationReducer,
      approval: approvalReducer,
    }),

    // NgRx Effects
    provideEffects([]),


    // NgRx DevTools — chỉ dùng khi development
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
    }),
  ],
};
