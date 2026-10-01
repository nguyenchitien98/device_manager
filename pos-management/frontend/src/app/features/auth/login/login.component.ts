import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Login Page Component — Sprint 01.
 *
 * Sử dụng OnPush Change Detection để tối ưu performance.
 * Signals reactive state: loading, error message.
 * Reactive Forms với validation.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ─── Signals ────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  // ─── Form ────────────────────────────────────────────────────────
  readonly loginForm = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]],
  });

  /** Submit form đăng nhập */
  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Nếu backend chưa chạy (connection refused), tự động fallback Mock Auth để test UI
        if (err?.status === 0) {
          this.useMockLogin();
        } else {
          this.errorMessage.set(this.mapError(err));
        }
      }
    });
  }

  /** Đăng nhập Demo trực tiếp mà không cần backend */
  useMockLogin(role: string = 'SUPER_ADMIN'): void {
    this.authService.mockLogin(role);
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/';
    this.router.navigateByUrl(returnUrl);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  // ─── Form helpers ────────────────────────────────────────────────
  get usernameControl() { return this.loginForm.get('username')!; }
  get passwordControl() { return this.loginForm.get('password')!; }

  isFieldInvalid(field: 'username' | 'password'): boolean {
    const control = this.loginForm.get(field)!;
    return control.invalid && (control.dirty || control.touched);
  }

  private mapError(err: any): string {
    const code = err?.error?.errorCode;
    switch (code) {
      case 'POS-1002': return 'Tài khoản bị khóa. Vui lòng thử lại sau 30 phút.';
      case 'POS-1001': return 'Tên đăng nhập hoặc mật khẩu không đúng.';
      case 'POS-1006': return 'Quá nhiều lần đăng nhập sai. Tài khoản tạm thời bị khóa.';
      default:
        if (err?.status === 0) return 'Không thể kết nối máy chủ. Vui lòng thử lại.';
        return err?.error?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.';
    }
  }
}
