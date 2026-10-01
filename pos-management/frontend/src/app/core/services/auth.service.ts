import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, LoginCredentials, UserInfo } from '../models/auth.models';

/**
 * Service quản lý trạng thái xác thực toàn bộ ứng dụng POS Management.
 *
 * Tại sao dùng Signal thay vì BehaviorSubject? Angular 22 khuyến khích
 * Signal-based state — reactive, synchronous, và tốt hơn cho change detection
 * OnPush. Signal tự động trigger re-render khi thay đổi mà không cần subscribe/unsubscribe.
 *
 * Luồng:
 * 1. Login → gọi API → lưu tokens vào localStorage → cập nhật signals
 * 2. Mọi HTTP request → JwtInterceptor inject token từ TokenService
 * 3. Token hết hạn → JwtInterceptor tự refresh token
 * 4. Logout → xóa storage → clear signals → redirect login
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiBaseUrl;

  // ─── Signals (reactive state) ──────────────────────────────────
  private readonly _currentUser = signal<UserInfo | null>(null);
  private readonly _isLoading = signal(false);

  /** User hiện tại đang đăng nhập (null nếu chưa đăng nhập) */
  readonly currentUser = this._currentUser.asReadonly();

  /** Computed: có đang đăng nhập không */
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /** Computed: danh sách roles của user hiện tại */
  readonly userRoles = computed(() => this._currentUser()?.roles ?? []);

  /** Computed: danh sách permissions của user hiện tại */
  readonly userPermissions = computed(() => this._currentUser()?.permissions ?? []);

  /** Loading state khi đang gọi API */
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    // Khôi phục trạng thái auth từ localStorage khi app khởi động
    this.restoreAuthState();
  }

  /**
   * Đăng nhập bằng username/password.
   *
   * @param credentials LoginCredentials
   * @returns Observable<AuthTokens>
   */
  login(credentials: LoginCredentials): Observable<{ data: AuthTokens }> {
    this._isLoading.set(true);
    return this.http.post<{ data: AuthTokens }>(
      `${this.apiUrl}/auth/login`, credentials
    ).pipe(
      tap({
        next: (response) => {
          this.handleAuthSuccess(response.data);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false)
      })
    );
  }

  /**
   * Mock login cho mục đích test UI local khi chưa bật backend server.
   */
  mockLogin(role: string = 'SUPER_ADMIN'): void {
    const mockUser: UserInfo = {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      email: 'admin@posbank.com.vn',
      fullName: 'Quản Trị Viên Hệ Thống (Demo)',
      roles: [role],
      permissions: [
        'CATALOG_VIEW', 'CATALOG_MANAGE',
        'INVENTORY_VIEW', 'INVENTORY_IMPORT', 'INVENTORY_EXPORT', 'INVENTORY_TRANSFER', 'INVENTORY_APPROVE',
        'MERCHANT_VIEW', 'MERCHANT_MANAGE',
        'ASSIGNMENT_VIEW', 'ASSIGNMENT_MANAGE',
        'DEVICE_VIEW', 'DEVICE_MANAGE',
        'APPROVAL_VIEW', 'APPROVAL_MANAGE',
        'REPORT_VIEW', 'REPORT_EXPORT',
        'AUDIT_VIEW',
        'ADMIN_USER_MANAGE', 'ADMIN_ROLE_MANAGE'
      ],
      businessUnitId: 'HO-001',
      businessUnitName: 'Hội Sở Chính',
      branchCode: 'HO-HA-NOI'
    };

    const mockTokens: AuthTokens = {
      accessToken: 'mock-jwt-access-token-demo',
      refreshToken: 'mock-jwt-refresh-token-demo',
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: mockUser
    };

    this.handleAuthSuccess(mockTokens);
  }

  /**
   * Làm mới Access Token bằng Refresh Token.
   *
   * @returns Observable với tokens mới
   */
  refreshToken(): Observable<{ data: AuthTokens }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ data: AuthTokens }>(
      `${this.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap((response) => this.handleAuthSuccess(response.data))
    );
  }

  /**
   * Đăng xuất — xóa toàn bộ auth state.
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    // Gọi logout API (best effort — không block nếu lỗi)
    this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken })
      .subscribe({ error: () => {} });

    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Kiểm tra user có permission cụ thể không.
   *
   * @param permission Permission code cần kiểm tra
   * @returns true nếu có permission
   */
  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  /**
   * Kiểm tra user có role cụ thể không.
   *
   * @param role Role name cần kiểm tra
   * @returns true nếu có role
   */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  /** Lấy Access Token từ localStorage. */
  getAccessToken(): string | null {
    return localStorage.getItem('pos_access_token');
  }

  /** Lấy Refresh Token từ localStorage. */
  getRefreshToken(): string | null {
    return localStorage.getItem('pos_refresh_token');
  }

  // ─── Private helpers ───────────────────────────────────────────

  private handleAuthSuccess(tokens: AuthTokens): void {
    localStorage.setItem('pos_access_token', tokens.accessToken);
    localStorage.setItem('pos_refresh_token', tokens.refreshToken);
    localStorage.setItem('pos_user', JSON.stringify(tokens.user));
    this._currentUser.set(tokens.user);
  }

  private clearAuthState(): void {
    localStorage.removeItem('pos_access_token');
    localStorage.removeItem('pos_refresh_token');
    localStorage.removeItem('pos_user');
    this._currentUser.set(null);
  }

  private restoreAuthState(): void {
    const userJson = localStorage.getItem('pos_user');
    const token = localStorage.getItem('pos_access_token');
    if (userJson && token) {
      try {
        this._currentUser.set(JSON.parse(userJson));
      } catch {
        this.clearAuthState();
      }
    }
  }
}
