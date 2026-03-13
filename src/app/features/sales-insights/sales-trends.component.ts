import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { RestaurantService } from '../../core/services/restaurant.service';
import { forkJoin } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-sales-trends',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChartCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-6">
      <div appAnimateOnScroll>
        <h1 class="text-2xl font-semibold text-text-primary">Sales Insights</h1>
        <p class="text-sm text-text-secondary mt-1">Menu performance and revenue analytics</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <app-chart-card appAnimateOnScroll title="Sales Trend" subtitle="Daily units sold" [chartOptions]="salesTrendOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Dish Popularity" subtitle="Top 15 by total units" [chartOptions]="dishPopularityOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Revenue by Category" subtitle="Menu category breakdown" [chartOptions]="categoryRevenueOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Peak Hours Heatmap" subtitle="Hour × Day of Week" [chartOptions]="heatmapOptions()" [loading]="loading()" [height]="320"></app-chart-card>
      </div>
    </div>
  `
})
export class SalesTrendsComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  loading = signal(true);
  salesTrendOptions = signal<EChartsOption>({});
  dishPopularityOptions = signal<EChartsOption>({});
  categoryRevenueOptions = signal<EChartsOption>({});
  heatmapOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    forkJoin({
      sales: this.restaurantService.getDailySales(),
      menuItems: this.restaurantService.getMenuItems(),
    }).subscribe(({ sales, menuItems }) => {
      const dishMap = new Map(menuItems.map((m: any) => [m.dishId, m]));

      // Sales trend
      const byDate = new Map<string, number>();
      for (const s of sales) { byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.unitsSold); }
      const dates = Array.from(byDate.keys()).sort();
      const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9' } };

      this.salesTrendOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 20, right: 20, bottom: 20, left: 50 },
        xAxis: { type: 'category', data: dates.map(d => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; }), axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: [{ type: 'line', data: dates.map(d => byDate.get(d)), smooth: true, lineStyle: { color: '#3b82f6', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } }, animationDuration: 1500 }],
      });

      // Dish popularity
      const byDish = new Map<string, number>();
      for (const s of sales) { byDish.set(s.dishId, (byDish.get(s.dishId) ?? 0) + s.unitsSold); }
      const topDishes = Array.from(byDish.entries()).map(([id, units]) => ({ name: (dishMap.get(id) as any)?.name ?? id, units })).sort((a, b) => b.units - a.units).slice(0, 15);

      this.dishPopularityOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 10, right: 40, bottom: 10, left: 160 },
        xAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        yAxis: { type: 'category', data: topDishes.map(d => d.name).reverse(), axisLabel: { color: '#94a3b8', fontSize: 10 }, axisLine: { show: false } },
        series: [{ type: 'bar', data: topDishes.map(d => d.units).reverse(), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#8b5cf6' }] }, borderRadius: [0, 6, 6, 0] }, barWidth: 16, animationDuration: 2000 }],
      });

      // Category revenue
      const byCategory = new Map<string, number>();
      for (const s of sales) {
        const item = dishMap.get(s.dishId) as any;
        if (item) { byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + s.totalRevenue); }
      }
      const catColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
      this.categoryRevenueOptions.set({
        tooltip: { trigger: 'item', ...tooltipStyle },
        legend: { bottom: 0, textStyle: { color: '#94a3b8' } },
        series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'], label: { show: false }, data: Array.from(byCategory.entries()).map(([name, value], i) => ({ name, value, itemStyle: { color: catColors[i % catColors.length] } })), animationType: 'scale', animationDuration: 1500 }],
      });

      // Heatmap (mock since we don't have hourly data)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const hours = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);
      const heatData: number[][] = [];
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 14; h++) {
          const base = d >= 4 ? 60 : 30;
          const peak = (h >= 4 && h <= 6) || (h >= 10 && h <= 12) ? 40 : 0;
          heatData.push([h, d, Math.floor(base + peak + Math.random() * 20)]);
        }
      }
      this.heatmapOptions.set({
        tooltip: { ...tooltipStyle, formatter: (p: any) => `${days[p.data[1]]} ${hours[p.data[0]]}<br/>Orders: ${p.data[2]}` },
        grid: { top: 10, right: 10, bottom: 40, left: 60 },
        xAxis: { type: 'category', data: hours, axisLabel: { color: '#94a3b8', fontSize: 9 }, splitArea: { show: true } },
        yAxis: { type: 'category', data: days, axisLabel: { color: '#94a3b8' } },
        visualMap: { min: 20, max: 100, show: false, inRange: { color: ['#1e3a5f', '#3b82f6', '#f59e0b', '#ef4444'] } },
        series: [{ type: 'heatmap', data: heatData, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }, animationDuration: 1500 }],
      });

      this.loading.set(false);
    });
  }
}
