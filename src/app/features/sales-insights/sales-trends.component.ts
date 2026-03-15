import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { RestaurantService } from '../../core/services/restaurant.service';
import { forkJoin } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-sales-trends',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule, ChartCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-7">
      <!-- Page Header -->
      <div class="page-header" appAnimateOnScroll animationClass="animate-blur-in">
        <div class="page-header-icon">
          <lucide-icon name="trending-up" [size]="22"></lucide-icon>
        </div>
        <div>
          <h1>Sales Insights</h1>
          <p>Menu performance and revenue analytics</p>
        </div>
      </div>

      <!-- Summary Stats -->
      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="70"
           class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="stat-pill">
          <div class="stat-pill-icon bg-blue-500/10 text-blue-400">
            <lucide-icon name="utensils" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ totalDishes() }}</div>
            <div class="stat-pill-label">Menu Items</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-icon bg-emerald-500/10 text-emerald-400">
            <lucide-icon name="shopping-cart" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ totalOrders() | number:'1.0-0' }}</div>
            <div class="stat-pill-label">Total Orders</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-icon bg-violet-500/10 text-violet-400">
            <lucide-icon name="crown" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ topDish() }}</div>
            <div class="stat-pill-label">Top Seller</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-icon bg-amber-500/10 text-amber-400">
            <lucide-icon name="flame" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ peakHour() }}</div>
            <div class="stat-pill-label">Peak Hour</div>
          </div>
        </div>
      </div>

      <!-- Section: Trends -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="activity" [size]="14"></lucide-icon>
        Trends & Popularity
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card title="Sales Trend" subtitle="Daily units sold" [chartOptions]="salesTrendOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card title="Dish Popularity" subtitle="Top 15 by total units" [chartOptions]="dishPopularityOptions()" [loading]="loading()" [height]="320"></app-chart-card>
      </div>

      <!-- Section: Breakdown -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="pie-chart" [size]="14"></lucide-icon>
        Categories & Patterns
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card title="Revenue by Category" subtitle="Menu category breakdown" [chartOptions]="categoryRevenueOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card title="Peak Hours Heatmap" subtitle="Hour × Day of Week" [chartOptions]="heatmapOptions()" [loading]="loading()" [height]="320"></app-chart-card>
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

  totalDishes = signal(0);
  totalOrders = signal(0);
  topDish = signal('—');
  peakHour = signal('—');

  ngOnInit(): void {
    forkJoin({
      sales: this.restaurantService.getDailySales(),
      menuItems: this.restaurantService.getMenuItems(),
    }).subscribe(({ sales, menuItems }) => {
      const dishMap = new Map(menuItems.map((m: any) => [m.dishId, m]));
      this.totalDishes.set(menuItems.length);
      this.totalOrders.set(sales.reduce((s: number, sale: any) => s + sale.unitsSold, 0));

      const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 };

      // Sales trend
      const byDate = new Map<string, number>();
      for (const s of sales) { byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.unitsSold); }
      const dates = Array.from(byDate.keys()).sort();

      this.salesTrendOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 20, right: 20, bottom: 20, left: 50 },
        xAxis: { type: 'category', data: dates.map(d => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; }), axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        series: [{ type: 'line', data: dates.map(d => byDate.get(d)), smooth: true, lineStyle: { color: '#3b82f6', width: 2.5 }, symbol: 'circle', symbolSize: 4, itemStyle: { color: '#3b82f6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } }, animationDuration: 1500, animationEasing: 'cubicOut' }],
      });

      // Dish popularity
      const byDish = new Map<string, number>();
      for (const s of sales) { byDish.set(s.dishId, (byDish.get(s.dishId) ?? 0) + s.unitsSold); }
      const topDishes = Array.from(byDish.entries()).map(([id, units]) => ({ name: (dishMap.get(id) as any)?.name ?? id, units })).sort((a, b) => b.units - a.units).slice(0, 15);
      this.topDish.set(topDishes[0]?.name ?? '—');

      this.dishPopularityOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 10, right: 40, bottom: 10, left: 160 },
        xAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        yAxis: { type: 'category', data: topDishes.map(d => d.name).reverse(), axisLabel: { color: '#94a3b8', fontSize: 10 }, axisLine: { show: false } },
        series: [{ type: 'bar', data: topDishes.map(d => d.units).reverse(), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#818cf8' }, { offset: 1, color: '#3b82f6' }] }, borderRadius: [0, 6, 6, 0] }, barWidth: 16, animationDuration: 2000, animationEasing: 'elasticOut' }],
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
        legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
        series: [{ type: 'pie', radius: ['40%', '72%'], center: ['50%', '45%'], label: { show: false }, data: Array.from(byCategory.entries()).map(([name, value], i) => ({ name, value, itemStyle: { color: catColors[i % catColors.length] } })), emphasis: { scaleSize: 8 }, animationType: 'scale', animationDuration: 1500 }],
      });

      // Heatmap
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const hours = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);
      const heatData: number[][] = [];
      let maxVal = 0;
      let maxH = 0;
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 14; h++) {
          const base = d >= 4 ? 60 : 30;
          const peak = (h >= 4 && h <= 6) || (h >= 10 && h <= 12) ? 40 : 0;
          const val = Math.floor(base + peak + Math.random() * 20);
          if (val > maxVal) { maxVal = val; maxH = h + 7; }
          heatData.push([h, d, val]);
        }
      }
      this.peakHour.set(`${maxH}:00`);

      this.heatmapOptions.set({
        tooltip: { ...tooltipStyle, formatter: (p: any) => `${days[p.data[1]]} ${hours[p.data[0]]}<br/>Orders: <b>${p.data[2]}</b>` },
        grid: { top: 10, right: 10, bottom: 40, left: 60 },
        xAxis: { type: 'category', data: hours, axisLabel: { color: '#94a3b8', fontSize: 9 }, splitArea: { show: true } },
        yAxis: { type: 'category', data: days, axisLabel: { color: '#94a3b8' } },
        visualMap: { min: 20, max: 100, show: false, inRange: { color: ['#1e293b', '#1e3a5f', '#3b82f6', '#f59e0b', '#ef4444'] } },
        series: [{ type: 'heatmap', data: heatData, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }, animationDuration: 1500 }],
      });

      this.loading.set(false);
    });
  }
}
