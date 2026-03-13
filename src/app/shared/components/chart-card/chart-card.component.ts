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
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-4" *ngIf="title">
        <h3 class="text-base font-semibold text-text-primary">{{ title }}</h3>
        <span class="text-xs text-text-secondary" *ngIf="subtitle">{{ subtitle }}</span>
      </div>
      <div *ngIf="loading" class="space-y-3">
        <div class="skeleton h-4 w-3/4"></div>
        <div class="skeleton h-40 w-full"></div>
        <div class="skeleton h-4 w-1/2"></div>
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
