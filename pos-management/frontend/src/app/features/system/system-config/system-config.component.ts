import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosSelectComponent,
  PosBadgeComponent, PosConfirmDialogComponent
} from '@shared';

@Component({
  selector: 'app-system-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosSelectComponent,
    PosBadgeComponent, PosConfirmDialogComponent
  ],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.scss'
})
export class SystemConfigPageComponent {
  // Tab control
  readonly activeTab = signal<'general' | 'smtp' | 'security' | 'integration'>('general');

  // General Settings
  systemName = signal('Hệ Thống Quản Lý POS & Thiết Bị Thanh Toán (POS Manager)');
  systemEmail = signal('admin-pos@bank.com.vn');
  autoLockMinutes = signal('15');
  recordsPerPage = signal('10');

  // SMTP Settings
  smtpHost = signal('smtp.bank.com.vn');
  smtpPort = signal('587');
  smtpUser = signal('pos-notification@bank.com.vn');
  smtpPassword = signal('••••••••••••');
  enableSsl = signal(true);

  // Security Settings
  minPasswordLength = signal('8');
  passwordExpiryDays = signal('90');
  maxLoginAttempts = signal('5');
  require2FA = signal(false);

  // Modal confirm save
  readonly isSaveModalOpen = signal(false);

  setTab(tab: 'general' | 'smtp' | 'security' | 'integration'): void {
    this.activeTab.set(tab);
  }

  onSaveConfig(): void {
    this.isSaveModalOpen.set(true);
  }

  confirmSaveConfig(): void {
    this.isSaveModalOpen.set(false);
  }
}
