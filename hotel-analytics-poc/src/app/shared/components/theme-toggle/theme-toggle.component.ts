import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeState } from '../../../core/state/theme.state';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-surface-tertiary"
      (click)="themeState.toggle()"
      [attr.aria-label]="themeState.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
      <lucide-icon
        [name]="themeState.isDark() ? 'sun' : 'moon'"
        [size]="18"
        class="text-text-secondary transition-transform hover:scale-110">
      </lucide-icon>
    </button>
  `,
  styles: [`:host { display: block; }`]
})
export class ThemeToggleComponent {
  themeState = inject(ThemeState);
}
