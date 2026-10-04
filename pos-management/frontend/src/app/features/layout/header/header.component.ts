import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, signal, HostListener, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserInfo } from '../../../core/models/auth.models';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly langService = inject(LanguageService);

  @Input() isDarkMode = false;
  @Input() currentPageTitle = 'Dashboard';
  @Input() notificationCount = 8;
  @Input() currentUser: UserInfo | null = null;

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  readonly isUserMenuOpen = signal(false);

  readonly userInitials = computed(() => {
    const name = this.currentUser?.fullName ?? 'Admin User';
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  onToggleLanguage(): void {
    this.langService.toggleLanguage();
  }

  onLogout(): void {
    this.closeUserMenu();
    this.logout.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen.set(false);
    }
  }
}
