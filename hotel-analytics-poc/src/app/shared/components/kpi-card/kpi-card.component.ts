import { Component, Input, OnChanges, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CurrencyShortPipe } from '../../pipes/currency-short.pipe';
import { PercentagePipe } from '../../pipes/percentage.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyShortPipe, PercentagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-card p-6 relative overflow-hidden group cursor-pointer"
         [class.border-l-4]="true"
         [ngClass]="{
           'border-l-blue-500': trend === 'flat',
           'border-l-emerald-500': trend === 'up',
           'border-l-red-500': trend === 'down'
         }">
      <div class="shimmer-effect absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="flex items-start justify-between mb-3">
        <span class="text-kpi-label uppercase tracking-wider text-text-secondary">{{ label }}</span>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center"
             [ngClass]="{
               'bg-blue-50 dark:bg-blue-900/30': trend === 'flat',
               'bg-emerald-50 dark:bg-emerald-900/30': trend === 'up',
               'bg-red-50 dark:bg-red-900/30': trend === 'down'
             }">
          <lucide-icon [name]="icon" [size]="20"
            [ngClass]="{
              'text-blue-600 dark:text-blue-400': trend === 'flat',
              'text-emerald-600 dark:text-emerald-400': trend === 'up',
              'text-red-600 dark:text-red-400': trend === 'down'
            }"></lucide-icon>
        </div>
      </div>
      <div class="text-kpi-value text-text-primary mb-2">
        <span *ngIf="format === 'currency'">{{ displayValue | currencyShort }}</span>
        <span *ngIf="format === 'percentage'">{{ displayValue | percentage }}</span>
        <span *ngIf="format === 'number'">{{ displayValue | number:'1.0-0' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 text-sm font-medium"
             [ngClass]="{
               'text-emerald-600 dark:text-emerald-400': trend === 'up',
               'text-red-600 dark:text-red-400': trend === 'down',
               'text-text-secondary': trend === 'flat'
             }">
          <lucide-icon *ngIf="trend === 'up'" name="arrow-up-right" [size]="16"></lucide-icon>
          <lucide-icon *ngIf="trend === 'down'" name="arrow-down-right" [size]="16"></lucide-icon>
          <lucide-icon *ngIf="trend === 'flat'" name="minus" [size]="16"></lucide-icon>
          <span>{{ trendPercentage }}%</span>
        </div>
        <span class="text-xs text-text-secondary">vs prev period</span>
      </div>
      <div class="mt-3 h-8" *ngIf="sparklineData?.length">
        <canvas #sparkCanvas class="w-full h-full"></canvas>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class KpiCardComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() value = 0;
  @Input() previousValue = 0;
  @Input() format: 'currency' | 'percentage' | 'number' = 'currency';
  @Input() trend: 'up' | 'down' | 'flat' = 'flat';
  @Input() trendPercentage = 0;
  @Input() icon = 'dollar-sign';
  @Input() sparklineData: number[] = [];
  @ViewChild('sparkCanvas') sparkCanvas!: ElementRef<HTMLCanvasElement>;

  displayValue = 0;
  private animationFrame: number | null = null;

  ngOnChanges(): void {
    this.animateValue();
    setTimeout(() => this.drawSparkline(), 100);
  }

  private animateValue(): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    const start = this.displayValue;
    const end = this.value;
    if (start === end) return;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValue = start + (end - start) * eased;
      this.cdr.markForCheck();
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.displayValue = end;
        this.cdr.markForCheck();
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  private drawSparkline(): void {
    if (!this.sparkCanvas?.nativeElement || !this.sparklineData?.length) return;
    const canvas = this.sparkCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const data = this.sparklineData;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = rect.width;
    const h = rect.height;
    const step = w / (data.length - 1);

    const color = this.trend === 'up' ? '#10b981' : this.trend === 'down' ? '#ef4444' : '#3b82f6';

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, h - ((data[0] - min) / range) * h);
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(i * step, h - ((data[i] - min) / range) * h);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '20');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}
