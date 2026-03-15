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
    <div class="chart-wrapper">
      <div class="chart-header" *ngIf="title">
        <div>
          <h3 class="chart-title">{{ title }}</h3>
          <span class="chart-subtitle" *ngIf="subtitle">{{ subtitle }}</span>
        </div>
      </div>
      <div *ngIf="loading" class="chart-skeleton">
        <div class="skeleton h-4 w-2/3"></div>
        <div class="skeleton h-[200px] w-full mt-3"></div>
      </div>
      <div *ngIf="!loading" class="w-full" [style.height.px]="height">
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
      border-radius: var(--radius-xl);
      padding: 24px;
      transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
    }
    .chart-wrapper:hover {
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
      border-color: rgba(129, 140, 248, 0.1);
    }
    :host-context(.dark) .chart-wrapper:hover {
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
    }
    .chart-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .chart-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    .chart-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
      display: block;
    }
    .chart-skeleton { padding: 8px 0; }
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
