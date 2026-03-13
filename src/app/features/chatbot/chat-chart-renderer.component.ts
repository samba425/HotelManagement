import { Component, Input, OnChanges, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ChartConfig } from '../../core/models/chat.model';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-chat-chart-renderer',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-48 rounded-lg overflow-hidden">
      <div echarts [options]="chartOptions()" class="w-full h-full"></div>
    </div>
  `,
  styles: [`:host { display: block; }`],
})
export class ChatChartRendererComponent implements OnChanges {
  @Input() config!: ChartConfig;
  chartOptions = signal<EChartsOption>({});

  ngOnChanges(): void {
    if (!this.config) return;
    this.chartOptions.set(this.buildOptions());
  }

  private buildOptions(): EChartsOption {
    const c = this.config;
    const isHorizontal = c.orientation === 'horizontal';
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9', fontSize: 11 } };

    if (c.chartType === 'bar') {
      return {
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 10, right: 10, bottom: 20, left: isHorizontal ? 120 : 40 },
        xAxis: isHorizontal
          ? { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 9 }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } }
          : { type: 'category', data: c.categories, axisLabel: { color: '#94a3b8', fontSize: 9 } },
        yAxis: isHorizontal
          ? { type: 'category', data: c.categories, axisLabel: { color: '#94a3b8', fontSize: 9 }, axisLine: { show: false } }
          : { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 9 }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: c.series.map((s, i) => ({
          name: s.name,
          type: 'bar' as const,
          data: s.data.map((v, j) => ({
            value: v,
            itemStyle: { color: colors[j % colors.length], borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
          })),
          barWidth: 14,
          animationDuration: 1200,
          animationEasing: 'elasticOut' as const,
        })),
      };
    }

    if (c.chartType === 'pie') {
      return {
        tooltip: { trigger: 'item', ...tooltipStyle },
        series: [{
          type: 'pie',
          radius: ['35%', '65%'],
          data: c.categories.map((name, i) => ({
            name,
            value: c.series[0]?.data[i] ?? 0,
            itemStyle: { color: colors[i % colors.length] },
          })),
          label: { show: false },
          animationType: 'scale',
          animationDuration: 1200,
        }],
      };
    }

    if (c.chartType === 'line') {
      return {
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 10, right: 10, bottom: 20, left: 40 },
        xAxis: { type: 'category', data: c.categories, axisLabel: { color: '#94a3b8', fontSize: 9 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 9 }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: c.series.map((s, i) => ({
          name: s.name,
          type: 'line' as const,
          data: s.data,
          smooth: true,
          lineStyle: { color: colors[i % colors.length], width: 2 },
          areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colors[i % colors.length] + '30' }, { offset: 1, color: colors[i % colors.length] + '00' }] } },
          animationDuration: 1500,
        })),
      };
    }

    if (c.chartType === 'gauge') {
      return {
        series: [{
          type: 'gauge',
          progress: { show: true, width: 10, itemStyle: { color: '#3b82f6' } },
          pointer: { show: false },
          axisLine: { lineStyle: { width: 10, color: [[1, '#334155']] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { valueAnimation: true, fontSize: 22, fontWeight: 700, color: '#3b82f6', formatter: '{value}%', offsetCenter: [0, '10%'] },
          data: [{ value: c.series[0]?.data[0] ?? 0 }],
          animationDuration: 1500,
        }],
      };
    }

    return {};
  }
}
