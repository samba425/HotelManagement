import { Component, inject, signal, effect, DestroyRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
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
  imports: [CommonModule, LucideAngularModule, KpiCardComponent, ChartCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-7">
      <!-- Hero Welcome -->
      <div class="dash-hero" appAnimateOnScroll animationClass="animate-blur-in">
        <div class="dash-hero-content">
          <div class="dash-hero-text">
            <div class="dash-hero-greeting">
              <lucide-icon name="sparkles" [size]="20" class="text-amber-400"></lucide-icon>
              <span>{{ greeting }}</span>
            </div>
            <h1>Dashboard Overview</h1>
            <p>Real-time performance across {{ branchState.branches().length }} locations</p>
          </div>
          <div class="dash-hero-stats">
            <div class="dash-stat">
              <div class="dash-stat-icon bg-blue-500/10 text-blue-400">
                <lucide-icon name="store" [size]="16"></lucide-icon>
              </div>
              <div>
                <div class="dash-stat-value">{{ branchState.branches().length }}</div>
                <div class="dash-stat-label">Locations</div>
              </div>
            </div>
            <div class="dash-stat">
              <div class="dash-stat-icon bg-emerald-500/10 text-emerald-400">
                <lucide-icon name="trending-up" [size]="16"></lucide-icon>
              </div>
              <div>
                <div class="dash-stat-value">{{ avgOccupancy() }}%</div>
                <div class="dash-stat-label">Avg Occupancy</div>
              </div>
            </div>
            <div class="dash-stat">
              <div class="dash-stat-icon bg-violet-500/10 text-violet-400">
                <lucide-icon name="calendar" [size]="16"></lucide-icon>
              </div>
              <div>
                <div class="dash-stat-value">{{ todayDate }}</div>
                <div class="dash-stat-label">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="80"
           class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

      <!-- Section: Revenue -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="bar-chart-3" [size]="14"></lucide-icon>
        Revenue Analytics
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card
          title="Revenue Trend"
          [subtitle]="dateState.dateRangeLabel()"
          [chartOptions]="revenueTrendOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>

        <app-chart-card
          title="Branch Revenue Comparison"
          subtitle="Current period"
          [chartOptions]="branchComparisonOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>
      </div>

      <!-- Section: Locations & Activity -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="map-pin" [size]="14"></lucide-icon>
        Locations & Live Activity
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- US Map -->
        <div class="lg:col-span-2">
          <app-chart-card
            title="Restaurant Locations"
            subtitle="US operations map"
            [chartOptions]="usMapOptions()"
            [loading]="loading()"
            [height]="340">
          </app-chart-card>
        </div>

        <!-- Live Activity Feed -->
        <div class="activity-feed glass-card" appAnimateOnScroll animationClass="animate-slide-right">
          <div class="activity-header">
            <div class="flex items-center gap-2">
              <div class="activity-live-dot"></div>
              <span class="text-[13px] font-semibold text-text-primary">Live Activity</span>
            </div>
            <span class="text-[10px] text-text-muted uppercase tracking-wider">Real-time</span>
          </div>
          <div class="activity-list">
            <div *ngFor="let event of activityFeed; let i = index"
                 class="activity-item"
                 [style.animation-delay.ms]="i * 150">
              <div class="activity-icon" [attr.data-type]="event.type">
                <lucide-icon [name]="event.icon" [size]="13"></lucide-icon>
              </div>
              <div class="activity-body">
                <div class="text-[12px] text-text-primary leading-snug">{{ event.text }}</div>
                <div class="text-[10px] text-text-muted mt-0.5">{{ event.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Operations -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="utensils" [size]="14"></lucide-icon>
        Operations & Menu
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card
          title="Top 10 Dishes Today"
          subtitle="By units sold"
          [chartOptions]="topDishesOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>

        <app-chart-card
          title="Occupancy by Location"
          subtitle="Current period average"
          [chartOptions]="occupancyGaugeOptions()"
          [loading]="loading()"
          [height]="320">
        </app-chart-card>
      </div>
    </div>
  `,
  styles: [`
    .dash-hero {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(24px) saturate(1.2);
      -webkit-backdrop-filter: blur(24px) saturate(1.2);
      border-radius: 22px;
      padding: 28px 32px;
      position: relative;
      overflow: hidden;
    }

    .dash-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(129, 140, 248, 0.06), rgba(6, 182, 212, 0.04), transparent);
      pointer-events: none;
    }

    .dash-hero::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #818cf8, #06b6d4, #8b5cf6, transparent);
      opacity: 0.5;
    }

    .dash-hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
    }

    .dash-hero-greeting {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .dash-hero-text h1 {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      line-height: 1.15;
    }

    .dash-hero-text p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .dash-hero-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .dash-stat {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--glass-border);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .dash-stat:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .dash-stat-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dash-stat-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .dash-stat-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ── Activity Feed ── */
    .activity-feed {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-default);
    }

    .activity-live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse-glow 2s ease-in-out infinite;
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
      50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
    }

    .activity-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 20px;
      animation: fade-up 0.4s ease both;
      transition: background 0.2s;
    }

    .activity-item:hover {
      background: rgba(129,140,248,0.03);
    }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .activity-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon[data-type="revenue"] { background: rgba(59,130,246,0.1); color: #60a5fa; }
    .activity-icon[data-type="order"]   { background: rgba(16,185,129,0.1); color: #34d399; }
    .activity-icon[data-type="alert"]   { background: rgba(245,158,11,0.1); color: #fbbf24; }
    .activity-icon[data-type="staff"]   { background: rgba(139,92,246,0.1); color: #a78bfa; }
    .activity-icon[data-type="guest"]   { background: rgba(236,72,153,0.1); color: #f472b6; }

    .activity-body { min-width: 0; }

    @media (max-width: 768px) {
      .dash-hero-content { flex-direction: column; align-items: flex-start; }
      .dash-hero-stats { width: 100%; }
    }
  `]
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
  avgOccupancy = signal(0);
  
  revenueTrendOptions = signal<EChartsOption>({});
  branchComparisonOptions = signal<EChartsOption>({});
  topDishesOptions = signal<EChartsOption>({});
  occupancyGaugeOptions = signal<EChartsOption>({});
  usMapOptions = signal<EChartsOption>({});

  greeting: string;
  todayDate: string;

  activityFeed = [
    { icon: 'dollar-sign', type: 'revenue', text: 'Manhattan revenue hit $42K today', time: '2 min ago' },
    { icon: 'shopping-cart', type: 'order', text: '38 covers at Beverly Hills (lunch rush)', time: '5 min ago' },
    { icon: 'trending-up', type: 'alert', text: 'Vegas occupancy reached 94%', time: '12 min ago' },
    { icon: 'users', type: 'staff', text: 'Evening shift started — 12 staff checked in', time: '18 min ago' },
    { icon: 'user', type: 'guest', text: 'VIP reservation at Chicago for 8 guests', time: '25 min ago' },
    { icon: 'zap', type: 'alert', text: 'Miami AC usage above threshold', time: '31 min ago' },
    { icon: 'dollar-sign', type: 'revenue', text: 'SF passed $28K daily target', time: '40 min ago' },
    { icon: 'shopping-cart', type: 'order', text: '52 dinner covers at Manhattan', time: '48 min ago' },
  ];

  constructor() {
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    this.todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

      const branches = this.branchState.branches();
      const totalRooms = branchId 
        ? (branches.find(b => b.branchId === branchId)?.totalRooms ?? 0)
        : branches.reduce((sum, b) => sum + b.totalRooms, 0);

      const sorted = [...financials].sort((a, b) => a.date.localeCompare(b.date));
      const mid = Math.floor(sorted.length / 2);
      const current = sorted.slice(mid);
      const previous = sorted.slice(0, mid);

      if (current.length > 0 && totalRooms > 0) {
        this.kpis.set(this.kpiEngine.buildKpiFromFinancials(current, previous, totalRooms));
      }

      const totalOccupied = financials.reduce((s, f) => s + f.roomsOccupied, 0);
      const totalAvail = totalRooms * financials.length;
      this.avgOccupancy.set(totalAvail > 0 ? Math.round((totalOccupied / totalAvail) * 100) : 0);

      this.buildRevenueTrend(sorted);
      this.buildBranchComparison(financials);
      this.buildTopDishes(sales, menuItems);
      this.buildOccupancyGauges(financials);
      this.buildUsMap(financials);
      this.loading.set(false);
    });
  }

  private buildRevenueTrend(financials: FinancialOperation[]): void {
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
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9', fontSize: 12 }, borderRadius: 10 },
      legend: { data: ['Revenue', 'Operating Costs'], bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
      grid: { top: 20, right: 20, bottom: 40, left: 60 },
      xAxis: { type: 'category', data: shortDates, axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8', fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10, formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
      series: [
        { name: 'Revenue', type: 'bar', data: revenues, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: '#3b82f6' }] }, borderRadius: [4, 4, 0, 0] }, barWidth: '40%', animationDuration: 1500, animationEasing: 'elasticOut' },
        { name: 'Operating Costs', type: 'line', data: costs, smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, symbol: 'circle', symbolSize: 4, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.15)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } }, animationDuration: 2000 },
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
    const gradients = [
      ['#60a5fa', '#3b82f6'], ['#a78bfa', '#8b5cf6'], ['#f472b6', '#ec4899'],
      ['#fbbf24', '#f59e0b'], ['#34d399', '#10b981'], ['#22d3ee', '#06b6d4']
    ];

    this.branchComparisonOptions.set({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9', fontSize: 12 }, borderRadius: 10, formatter: (params: any) => { const p = params[0]; return `<b>${p.name}</b><br/>Revenue: $${(p.value/1000000).toFixed(2)}M`; } },
      grid: { top: 10, right: 40, bottom: 10, left: 140 },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10, formatter: (v: number) => `$${(v/1000000).toFixed(1)}M` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
      yAxis: { type: 'category', data: names, inverse: true, axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: revenues.map((v, i) => ({ value: v, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: gradients[i % gradients.length][0] }, { offset: 1, color: gradients[i % gradients.length][1] }] }, borderRadius: [0, 6, 6, 0] } })), barWidth: 24, animationDuration: 1800, animationEasing: 'elasticOut' }],
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
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 },
      grid: { top: 10, right: 40, bottom: 10, left: 160 },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
      yAxis: { type: 'category', data: sorted.map(d => d.name).reverse(), axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ type: 'bar', data: sorted.map(d => d.units).reverse(), itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#818cf8' }, { offset: 1, color: '#3b82f6' }] }, borderRadius: [0, 6, 6, 0] }, barWidth: 18, animationDuration: 2000, animationEasing: 'elasticOut' }],
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
      tooltip: { trigger: 'item', backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 },
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
        axisLine: { lineStyle: { width: 8, color: [[1, 'rgba(51,65,85,0.3)']] } },
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

  private buildUsMap(financials: FinancialOperation[]): void {
    const branches = this.branchState.branches();
    const byBranch = new Map<string, number>();
    for (const f of financials) {
      byBranch.set(f.branchId, (byBranch.get(f.branchId) ?? 0) + f.dailyRevenue);
    }

    const cityCoords: Record<string, [number, number]> = {
      'New York': [-73.98, 40.76],
      'Miami Beach': [-80.13, 25.79],
      'Beverly Hills': [-118.40, 34.07],
      'Chicago': [-87.63, 41.88],
      'San Francisco': [-122.42, 37.77],
      'Las Vegas': [-115.14, 36.17],
    };

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    const scatterData = branches.map((b, i) => {
      const city = b.location?.city ?? '';
      const coords = cityCoords[city] ?? [0, 0];
      const rev = byBranch.get(b.branchId) ?? 0;
      return {
        name: b.name,
        value: [...coords, rev],
        itemStyle: {
          color: colors[i % colors.length],
          shadowBlur: 12,
          shadowColor: colors[i % colors.length] + '66',
        },
        city,
      };
    });

    const usOutline = [
      [-124.7,48.4],[-123.1,48.2],[-122.8,48.1],[-117.0,49.0],[-116.0,49.0],
      [-110.0,49.0],[-104.1,49.0],[-100.0,49.0],[-97.2,49.0],[-95.2,49.0],
      [-95.1,48.0],[-89.5,48.0],[-84.8,46.8],[-82.5,45.3],[-82.1,43.6],
      [-79.0,43.3],[-76.9,43.6],[-75.3,44.8],[-71.5,45.0],[-69.7,47.2],
      [-67.1,45.1],[-67.8,44.5],[-70.7,43.1],[-71.2,41.7],[-72.5,41.0],
      [-74.0,40.7],[-74.3,39.5],[-75.5,39.2],[-75.5,38.0],[-76.3,37.6],
      [-76.0,36.9],[-75.9,36.5],[-77.0,35.5],[-78.6,33.9],[-79.8,32.8],
      [-80.8,32.1],[-81.2,31.2],[-81.5,30.7],[-80.5,28.5],[-80.1,26.1],
      [-80.5,25.2],[-81.8,25.1],[-82.7,27.5],[-83.7,28.3],[-84.9,29.7],
      [-85.6,30.0],[-86.8,30.4],[-88.1,30.3],[-89.2,29.8],[-89.6,28.9],
      [-90.0,29.0],[-91.3,29.2],[-93.8,29.8],[-94.6,29.4],[-96.6,28.4],
      [-97.2,26.0],[-97.7,25.9],[-99.1,26.4],[-101.4,29.8],[-103.3,29.0],
      [-104.7,30.0],[-106.6,31.8],[-108.2,31.8],[-111.1,31.3],[-114.7,32.7],
      [-117.3,32.5],[-118.6,34.0],[-120.6,34.6],[-121.9,36.6],[-122.4,37.8],
      [-123.7,38.9],[-124.2,40.0],[-124.5,42.0],[-124.6,44.0],[-124.0,46.3],
      [-124.7,48.4],
    ];

    const connectionLines = scatterData.map(d => ({
      coords: [
        d.value.slice(0, 2),
        [-98, 38.5],
      ],
    }));

    this.usMapOptions.set({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(129,140,248,0.2)',
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        borderRadius: 10,
        padding: [10, 14],
        formatter: (p: any) => {
          if (!p.data?.city) return '';
          const d = p.data;
          return `<b style="font-size:13px">${d.name}</b><br/><span style="color:#94a3b8">${d.city}</span><br/><span style="color:#60a5fa">Revenue: $${(d.value[2] / 1e6).toFixed(2)}M</span>`;
        },
      },
      xAxis: { type: 'value', min: -128, max: -64, show: false },
      yAxis: { type: 'value', min: 23, max: 51, show: false },
      grid: { top: 8, right: 16, bottom: 8, left: 16 },
      series: [
        {
          type: 'line',
          coordinateSystem: 'cartesian2d',
          data: usOutline.map(c => c),
          symbol: 'none',
          lineStyle: { color: 'rgba(129,140,248,0.12)', width: 1.5 },
          areaStyle: { color: 'rgba(129,140,248,0.03)' },
          silent: true,
          tooltip: { show: false },
          animation: false,
          z: 1,
        },
        {
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          data: connectionLines,
          lineStyle: {
            color: 'rgba(129,140,248,0.08)',
            width: 1,
            curveness: 0.2,
            type: 'dashed',
          },
          silent: true,
          tooltip: { show: false },
          z: 2,
          effect: {
            show: true,
            period: 6,
            trailLength: 0.3,
            symbol: 'circle',
            symbolSize: 3,
            color: 'rgba(129,140,248,0.3)',
          },
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'cartesian2d',
          data: scatterData,
          symbolSize: 10,
          encode: { x: 0, y: 1 },
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke', scale: 5, period: 3, number: 2 },
          itemStyle: { shadowBlur: 10 },
          label: { show: false },
          tooltip: { show: false },
          z: 3,
          animationDuration: 2000,
        },
        {
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          data: scatterData,
          symbolSize: (val: number[]) => Math.max(16, Math.min(36, val[2] / 60000)),
          encode: { x: 0, y: 1 },
          label: {
            show: true,
            formatter: (p: any) => p.data.city,
            position: 'top',
            color: '#94a3b8',
            fontSize: 10,
            fontWeight: 500,
            distance: 12,
            textBorderColor: 'rgba(7,13,26,0.8)',
            textBorderWidth: 2,
          },
          emphasis: {
            scale: 1.6,
            label: { color: '#e8edf5', fontSize: 11, fontWeight: 700 },
            itemStyle: { shadowBlur: 24, shadowColor: 'rgba(59,130,246,0.5)' },
          },
          z: 4,
          animationDelay: (idx: number) => idx * 250,
          animationDuration: 1200,
          animationEasing: 'elasticOut',
        },
      ],
    });
  }
}
