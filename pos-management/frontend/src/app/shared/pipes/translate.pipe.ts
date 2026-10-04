import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Pure: false enables instant UI updates when signal language state changes
})
export class TranslatePipe implements PipeTransform {
  private readonly langService = inject(LanguageService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.langService.translate(key, params);
  }
}
