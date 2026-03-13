import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeState {
  readonly isDark = signal(true);

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      this.isDark.set(false);
    }

    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }
}
