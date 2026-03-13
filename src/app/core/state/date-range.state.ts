import { Injectable, signal, computed } from '@angular/core';

export type DatePreset = '7d' | '30d' | '90d' | 'custom';

@Injectable({ providedIn: 'root' })
export class DateRangeState {
  readonly startDate = signal<Date>(new Date(Date.now() - 30 * 86400000));
  readonly endDate = signal<Date>(new Date());
  readonly preset = signal<DatePreset>('30d');

  readonly dateRangeLabel = computed(() => {
    const p = this.preset();
    if (p === '7d') return 'Last 7 Days';
    if (p === '30d') return 'Last 30 Days';
    if (p === '90d') return 'Last 90 Days';
    return `${this.startDate().toLocaleDateString()} - ${this.endDate().toLocaleDateString()}`;
  });

  setPreset(preset: DatePreset): void {
    this.preset.set(preset);
    const now = new Date();
    this.endDate.set(now);
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
    if (preset !== 'custom') {
      this.startDate.set(new Date(now.getTime() - days * 86400000));
    }
  }

  setCustomRange(start: Date, end: Date): void {
    this.preset.set('custom');
    this.startDate.set(start);
    this.endDate.set(end);
  }
}
