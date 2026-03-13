import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { DateRangeState, DatePreset } from '../../../core/state/date-range.state';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1">
      <lucide-icon name="calendar-range" [size]="16" class="text-accent-primary mr-1"></lucide-icon>
      <button *ngFor="let opt of presets"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
        [ngClass]="dateState.preset() === opt.value
          ? 'bg-accent-primary text-white shadow-sm'
          : 'text-text-secondary hover:bg-surface-tertiary'"
        (click)="dateState.setPreset(opt.value)">
        {{ opt.label }}
      </button>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class DateRangePickerComponent {
  dateState = inject(DateRangeState);

  presets: { label: string; value: DatePreset }[] = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
  ];
}
