import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrapper group">
      <div class="chart-accent"></div>
      <div class="chart-corner-glow"></div>
      <div class="chart-header" *ngIf="title">
        <div>
          <h3 class="chart-title">{{ title }}</h3>
          <span class="chart-subtitle" *ngIf="subtitle">{{ subtitle }}</span>
        </div>
        <div class="chart-live-badge" *ngIf="!loading">
          <span class="chart-live-dot"></span>
          Live
        </div>
      </div>
      <div *ngIf="loading" class="chart-skeleton">
        <div class="skeleton-line w-2/3"></div>
        <div class="skeleton-chart"></div>
      </div>
      <div *ngIf="!loading" class="w-full chart-body" [style.height.px]="height">
        <div echarts
             [options]="chartOptions"
             [merge]="mergeOptions"
             class="w-full h-full"
             (chartInit)="onChartInit($event)">
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .chart-wrapper {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
      border-radius: 20px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.4s ease;
    }

    .chart-wrapper:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
      border-color: rgba(129, 140, 248, 0.12);
    }

    :host-context(.dark) .chart-wrapper:hover {
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
      border-color: rgba(129, 140, 248, 0.1);
    }

    .chart-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, rgba(129, 140, 248, 0.3), rgba(6, 182, 212, 0.2), transparent);
      opacity: 0;
      transition: opacity 0.4s;
    }

    .chart-wrapper:hover .chart-accent {
      opacity: 1;
    }

    .chart-corner-glow {
      position: absolute;
      top: -60px;
      right: -60px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(129, 140, 248, 0.04) 0%, transparent 70%);
      pointer-events: none;
    }

    .chart-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .chart-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .chart-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 3px;
      display: block;
    }

    .chart-live-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.1);
    }

    .chart-live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }

    .chart-body {
      position: relative;
      z-index: 1;
    }

    .chart-skeleton {
      padding: 8px 0;
      position: relative;
      z-index: 1;
    }

    .skeleton-line {
      height: 14px;
      border-radius: 7px;
      background: linear-gradient(90deg, var(--surface-tertiary) 25%, var(--border-default) 50%, var(--surface-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-chart {
      height: 200px;
      margin-top: 16px;
      border-radius: 12px;
      background: linear-gradient(90deg, var(--surface-tertiary) 25%, var(--border-default) 50%, var(--surface-tertiary) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      animation-delay: 0.2s;
    }

    @keyframes shimmer {
      0%, 100% { background-position: 200% 0; }
      50%      { background-position: -200% 0; }
    }
  `]
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() loading = false;
  @Input() height = 300;
  @Input() chartOptions: EChartsOption = {};
  @Input() mergeOptions: EChartsOption = {};

  private chartInstance: any;

  onChartInit(ec: any): void {
    this.chartInstance = ec;
    window.addEventListener('resize', () => ec.resize());
  }
}
