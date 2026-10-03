import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosBadgeComponent,
  PosConfirmDialogComponent
} from '@shared';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosBadgeComponent,
    PosConfirmDialogComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfilePageComponent {
  readonly profile = signal({
    username: 'admin_long',
    fullName: 'Nguyễn Hoàng Long',
    email: 'long.nh@bank.com.vn',
    phone: '0912345678',
    department: 'Khối Công Nghệ Thông Tin & Ngân Hàng Số',
    roleName: 'Quản trị viên Hệ thống (Super Admin)',
    createdDate: '15/01/2025'
  });

  // Form Profile Edit
  fullName = signal('Nguyễn Hoàng Long');
  email = signal('long.nh@bank.com.vn');
  phone = signal('0912345678');

  // Change password form
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  readonly isSuccessModalOpen = signal(false);
  readonly successMessage = signal('');

  saveProfile(): void {
    this.profile.update(p => ({
      ...p,
      fullName: this.fullName(),
      email: this.email(),
      phone: this.phone()
    }));
    this.successMessage.set('Đã cập nhật thông tin cá nhân thành công!');
    this.isSuccessModalOpen.set(true);
  }

  changePassword(): void {
    if (this.newPassword() !== this.confirmPassword()) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.successMessage.set('Đã đổi mật khẩu tài khoản thành công!');
    this.isSuccessModalOpen.set(true);
  }
}
