import { Component, inject, signal, effect, DestroyRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { FinancialService } from '../../core/services/financial.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { KpiEngineService } from '../../core/services/kpi-engine.service';
import { BranchState } from '../../core/state/branch.state';
import { DateRangeState } from '../../core/state/date-range.state';
import { KpiData } from '../../core/models/financial.model';
import { FinancialOperation } from '../../core/models/financial.model';
import { forkJoin, Subscription } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, ChartCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div appAnimateOnScroll>
        <h1 class="text-2xl font-semibold text-text-primary">Dashboard Overview</h1>
        <p class="text-sm text-text-secondary mt-1">Real-time performance across all properties</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" appAnimateOnScroll>
        <app-kpi-card
          *ngFor="let kpi of kpis()"
          [label]="kpi.label"
          [value]="kpi.value"
          [previousValue]="kpi.previousValue"
          [format]="kpi.format"
          [trend]="kpi.trend"
          [trendPercentage]="kpi.trendPercentage"
          [icon]="kpi.icon"
          [accent]="kpi.accent"
          [sparklineData]="kpi.sparklineData || []">
        </app-kpi-card>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <app-chart-card
          appAnimateOnScroll
          title="Revenue Trend"
          [subtitle]="dateState.dateRangeLabel()"
          [chartOptions]="revenueTrendOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>

        <app-chart-card
          appAnimateOnScroll
          title="Branch Revenue Comparison"
          subtitle="Current period"
          [chartOptions]="branchComparisonOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>

        <app-chart-card
          appAnimateOnScroll
          title="Top 10 Dishes Today"
          subtitle="By units sold"
          [chartOptions]="topDishesOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>

        <app-chart-card
          appAnimateOnScroll
          title="Occupancy by Property"
          subtitle="Current period average"
          [chartOptions]="occupancyGaugeOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private financialService = inject(FinancialService);
  private restaurantService = inject(RestaurantService);
  private kpiEngine = inject(KpiEngineService);
  branchState = inject(BranchState);
  dateState = inject(DateRangeState);
  private destroyRef = inject(DestroyRef);
  private activeSub: Subscription | null = null;

  loading = signal(true);
  kpis = signal<KpiData[]>([]);
  financials = signal<FinancialOperation[]>([]);
  
  revenueTrendOptions = signal<EChartsOption>({});
  branchComparisonOptions = signal<EChartsOption>({});
  topDishesOptions = signal<EChartsOption>({});
  occupancyGaugeOptions = signal<EChartsOption>({});

  constructor() {
    effect(() => {
      const branches = this.branchState.branches();
      if (branches.length > 0) {
        untracked(() => this.loadData());
      }
    });
    this.destroyRef.onDestroy(() => this.activeSub?.unsubscribe());
  }

  private loadData(): void {
    this.activeSub?.unsubscribe();
    this.loading.set(true);
    const branchId = this.branchState.selectedBranchId() ?? undefined;
    
    this.activeSub = forkJoin({
      financials: this.financialService.getFinancialOps(branchId),
      sales: this.restaurantService.getDailySales(),
      menuItems: this.restaurantService.getMenuItems(),
    }).subscribe(({ financials, sales, menuItems }) => {
      this.financials.set(financials);

      // Calculate total rooms for KPI
      const branches = this.branchState.branches();
      const totalRooms = branchId 
        ? (branches.find(b => b.branchId === branchId)?.totalRooms ?? 0)
        : branches.reduce((sum, b) => sum + b.totalRooms, 0);

      // Split current/previous periods
      const sorted = [...financials].sort((a, b) => a.date.localeCompare(b.date));
      const mid = Math.floor(sorted.length / 2);
      const current = sorted.slice(mid);
      const previous = sorted.slice(0, mid);

      if (current.length > 0 && totalRooms > 0) {
        this.kpis.set(this.kpiEngine.buildKpiFromFinancials(current, previous, totalRooms));
      }

      this.buildRevenueTrend(sorted);
      this.buildBranchComparison(financials);
      this.buildTopDishes(sales, menuItems);
      this.buildOccupancyGauges(financials);
      this.loading.set(false);
    });
  }

  private buildRevenueTrend(financials: FinancialOperation[]): void {
    // Group by date, sum revenue and costs
    const byDate = new Map<string, { revenue: number; costs: number }>();
    for (const f of financials) {
      const existing = byDate.get(f.date) ?? { revenue: 0, costs: 0 };
      existing.revenue += f.dailyRevenue;
      existing.costs += f.operationalCosts;
      byDate.set(f.date, existing);
    }
    const dates = Array.from(byDate.keys()).sort();
    const revenues = dates.map(d => byDate.get(d)!.revenue);
    const costs = dates.map(d => byDate.get(d)!.costs);
    const shortDates = dates.map(d => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; });

    this.revenueTrendOptions.set({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9', fontSize: 12 } },
      legend: { data: ['Revenue', 'Operating Costs'], bottom: 0, textStyle: { color: '#94a3b8' } },
      grid: { top: 20, right: 20, bottom: 40, left: 60 },
      xAxis: { type: 'category', data: shortDates, axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8', fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10, formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
      series: [
        { name: 'Revenue', type: 'bar', data: revenues, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, barWidth: '40%', animationDuration: 1500, animationEasing: 'elasticOut' },
        { name: 'Operating Costs', type: 'line', data: costs, smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.15)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } }, animationDuration: 2000 },
      ],
    });
  }

  private buildBranchComparison(financials: FinancialOperation[]): void {
    const branches = this.branchState.branches();
    const byBranch = new Map<string, number>();
    for (const f of financials) {
      byBranch.set(f.branchId, (byBranch.get(f.branchId) ?? 0) + f.dailyRevenue);
    }
    const names = branches.map(b => b.name);
    const revenues = branches.map(b => byBranch.get(b.branchId) ?? 0);
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    this.branchComparisonOptions.set({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9', fontSize: 12 }, formatter: (params: any) => { const p = params[0]; return `${p.name}<br/>Revenue: $${(p.value/1000000).toFixed(2)}M`; } },
      grid: { top: 10, right: 40, bottom: 10, left: 140 },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10, formatter: (v: number) => `$${(v/1000000).toFixed(1)}M` }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
      yAxis: { type: 'category', data: names, inverse: true, axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: revenues.map((v, i) => ({ value: v, itemStyle: { color: colors[i % colors.length], borderRadius: [0, 6, 6, 0] } })), barWidth: 24, animationDuration: 1800, animationEasing: 'elasticOut' }],
    });
  }

  private buildTopDishes(sales: any[], menuItems: any[]): void {
    const dishMap = new Map<string, string>();
    for (const item of menuItems) { dishMap.set(item.dishId, item.name); }
    
    const totalByDish = new Map<string, number>();
    for (const sale of sales) {
      totalByDish.set(sale.dishId, (totalByDish.get(sale.dishId) ?? 0) + sale.unitsSold);
    }
    
    const sorted = Array.from(totalByDish.entries())
      .map(([dishId, units]) => ({ name: dishMap.get(dishId) ?? dishId, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 10);

    this.topDishesOptions.set({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9' } },
      grid: { top: 10, right: 40, bottom: 10, left: 160 },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
      yAxis: { type: 'category', data: sorted.map(d => d.name).reverse(), axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: sorted.map(d => d.units).reverse(), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#8b5cf6' }] }, borderRadius: [0, 6, 6, 0] }, barWidth: 18, animationDuration: 2000, animationEasing: 'elasticOut' }],
    });
  }

  private buildOccupancyGauges(financials: FinancialOperation[]): void {
    const branches = this.branchState.branches();
    const occupancyByBranch = branches.map(branch => {
      const branchFinancials = financials.filter(f => f.branchId === branch.branchId);
      const totalOccupied = branchFinancials.reduce((sum, f) => sum + f.roomsOccupied, 0);
      const totalAvailable = branch.totalRooms * branchFinancials.length;
      const rate = totalAvailable > 0 ? (totalOccupied / totalAvailable) * 100 : 0;
      return { name: branch.name.split(' ').slice(0, 2).join(' '), value: Math.round(rate * 10) / 10 };
    });

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    
    this.occupancyGaugeOptions.set({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9' } },
      series: occupancyByBranch.map((item, i) => ({
        type: 'gauge',
        center: [`${(i % 3) * 33.3 + 16.7}%`, `${Math.floor(i / 3) * 50 + 30}%`],
        radius: '35%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        progress: { show: true, width: 8, itemStyle: { color: colors[i] } },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 8, color: [[1, '#334155']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { offsetCenter: [0, '80%'], fontSize: 11, color: '#94a3b8' },
        detail: { valueAnimation: true, offsetCenter: [0, '30%'], fontSize: 18, fontWeight: 700, color: colors[i], formatter: '{value}%' },
        data: [{ value: item.value, name: item.name }],
        animationDuration: 2000,
        animationEasing: 'cubicOut',
      })),
    });
  }
}
