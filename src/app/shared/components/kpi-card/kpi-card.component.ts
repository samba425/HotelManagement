import { Component, Input, OnChanges, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CurrencyShortPipe } from '../../pipes/currency-short.pipe';
import { PercentagePipe } from '../../pipes/percentage.pipe';

const COLOR_PALETTE: Record<string, { light: string; dark: string; glow: string }> = {
  blue:    { light: '#3b82f6', dark: '#60a5fa', glow: '59, 130, 246' },
  cyan:    { light: '#06b6d4', dark: '#22d3ee', glow: '6, 182, 212' },
  violet:  { light: '#8b5cf6', dark: '#a78bfa', glow: '139, 92, 246' },
  emerald: { light: '#10b981', dark: '#34d399', glow: '16, 185, 129' },
  rose:    { light: '#f43f5e', dark: '#fb7185', glow: '244, 63, 94' },
  amber:   { light: '#f59e0b', dark: '#fbbf24', glow: '245, 158, 11' },
};

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyShortPipe, PercentagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-card group cursor-pointer relative overflow-hidden"
         [style.--accent]="accentColor"
         [style.--accent-glow]="accentGlow">
      <div class="kpi-accent-bar"></div>
      <div class="kpi-glow"></div>
      <div class="shimmer-effect absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="p-5 relative z-10">
        <div class="flex items-start justify-between mb-4">
          <span class="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">{{ label }}</span>
          <div class="kpi-icon-wrap">
            <lucide-icon [name]="icon" [size]="18"></lucide-icon>
          </div>
        </div>
        <div class="text-[28px] font-bold text-text-primary leading-none mb-3 tracking-tight">
          <span *ngIf="format === 'currency'">{{ displayValue | currencyShort }}</span>
          <span *ngIf="format === 'percentage'">{{ displayValue | percentage }}</span>
          <span *ngIf="format === 'number'">{{ displayValue | number:'1.0-0' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="kpi-trend-badge" [attr.data-trend]="trend">
            <lucide-icon *ngIf="trend === 'up'" name="arrow-up-right" [size]="13"></lucide-icon>
            <lucide-icon *ngIf="trend === 'down'" name="arrow-down-right" [size]="13"></lucide-icon>
            <lucide-icon *ngIf="trend === 'flat'" name="minus" [size]="13"></lucide-icon>
            <span>{{ trendPercentage }}%</span>
          </div>
          <span class="text-[11px] text-text-secondary">vs prev period</span>
        </div>
        <div class="mt-4 h-10" *ngIf="sparklineData.length">
          <canvas #sparkCanvas class="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .kpi-card {
      background: var(--glass-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
      position: relative;
    }

    .kpi-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(var(--accent-glow), 0.12);
      border-color: rgba(var(--accent-glow), 0.2);
    }

    :host-context(.dark) .kpi-card:hover {
      box-shadow: 0 8px 32px rgba(var(--accent-glow), 0.15);
      border-color: rgba(var(--accent-glow), 0.25);
    }

    .kpi-accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      border-radius: 16px 16px 0 0;
      background: linear-gradient(90deg, var(--accent), transparent);
      opacity: 0.7;
    }

    .kpi-glow {
      position: absolute;
      top: -40px;
      right: -40px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--accent-glow), 0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .kpi-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--accent-glow), 0.1);
      color: var(--accent);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .group:hover .kpi-icon-wrap {
      transform: scale(1.1);
      box-shadow: 0 0 16px rgba(var(--accent-glow), 0.2);
    }

    .kpi-trend-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .kpi-trend-badge[data-trend="up"] {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .kpi-trend-badge[data-trend="down"] {
      background: rgba(239, 68, 68, 0.08);
      color: #ef4444;
    }
    .kpi-trend-badge[data-trend="flat"] {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
    }

    :host-context(.dark) .kpi-trend-badge[data-trend="up"] {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
    }
    :host-context(.dark) .kpi-trend-badge[data-trend="down"] {
      background: rgba(248, 113, 113, 0.08);
      color: #f87171;
    }
    :host-context(.dark) .kpi-trend-badge[data-trend="flat"] {
      background: rgba(148, 163, 184, 0.08);
      color: #94a3b8;
    }
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
  @Input() accent: string = 'blue';
  @ViewChild('sparkCanvas') sparkCanvas!: ElementRef<HTMLCanvasElement>;

  displayValue = 0;
  accentColor = '#60a5fa';
  accentGlow = '59, 130, 246';
  private animationFrame: number | null = null;

  ngOnChanges(): void {
    const palette = COLOR_PALETTE[this.accent] || COLOR_PALETTE['blue'];
    const isDark = document.documentElement.classList.contains('dark');
    this.accentColor = isDark ? palette.dark : palette.light;
    this.accentGlow = palette.glow;

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

    const color = this.accentColor;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, h - ((data[0] - min) / range) * h);
    for (let i = 1; i < data.length; i++) {
      const x = i * step;
      const y = h - ((data[i] - min) / range) * h;
      const prevX = (i - 1) * step;
      const prevY = h - ((data[i - 1] - min) / range) * h;
      const cpx = (prevX + x) / 2;
      ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '18');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}
