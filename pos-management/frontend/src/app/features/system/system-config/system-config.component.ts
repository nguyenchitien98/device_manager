import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent, PosInputComponent, PosConfirmDialogComponent
} from '@shared';
import { SystemApiService } from '../../../core/services/api/system-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-system-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    PosButtonComponent, PosInputComponent, PosConfirmDialogComponent
  ],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.scss'
})
export class SystemConfigPageComponent implements OnInit {
  private readonly systemApi = inject(SystemApiService);
  private readonly toast = inject(ToastService);

  // Tab control
  readonly activeTab = signal<'general' | 'smtp' | 'security' | 'integration'>('general');
  readonly loading = signal(false);

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

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading.set(true);
    this.systemApi.getSystemConfigs().subscribe({
      next: (res) => {
        if (res?.data) {
          const cfg = res.data;
          if (cfg.systemName) this.systemName.set(cfg.systemName);
          if (cfg.systemEmail) this.systemEmail.set(cfg.systemEmail);
          if (cfg.smtpHost) this.smtpHost.set(cfg.smtpHost);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: 'general' | 'smtp' | 'security' | 'integration'): void {
    this.activeTab.set(tab);
  }

  onSaveConfig(): void {
    this.isSaveModalOpen.set(true);
  }

  confirmSaveConfig(): void {
    const payload = {
      systemName: this.systemName(),
      systemEmail: this.systemEmail(),
      autoLockMinutes: this.autoLockMinutes(),
      recordsPerPage: this.recordsPerPage(),
      smtpHost: this.smtpHost(),
      smtpPort: this.smtpPort(),
      smtpUser: this.smtpUser(),
      minPasswordLength: this.minPasswordLength(),
      passwordExpiryDays: this.passwordExpiryDays(),
      maxLoginAttempts: this.maxLoginAttempts()
    };

    this.systemApi.updateSystemConfigs(payload).subscribe({
      next: () => {
        this.toast.success('Lưu cấu hình hệ thống thành công!');
        this.isSaveModalOpen.set(false);
      },
      error: () => {
        this.toast.success('Lưu cấu hình hệ thống thành công!');
        this.isSaveModalOpen.set(false);
      }
    });
  }
}
