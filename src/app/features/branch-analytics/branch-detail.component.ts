import { Component, inject, signal, ChangeDetectionStrategy, effect, DestroyRef, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { FinancialService } from '../../core/services/financial.service';
import { UtilityService } from '../../core/services/utility.service';
import { LaborService } from '../../core/services/labor.service';
import { KpiEngineService } from '../../core/services/kpi-engine.service';
import { BranchState } from '../../core/state/branch.state';
import { KpiData } from '../../core/models/financial.model';
import { forkJoin, Subscription } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, KpiCardComponent, ChartCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-6">
      <div class="relative h-48 rounded-2xl overflow-hidden" appAnimateOnScroll>
        <div class="absolute inset-0 bg-gradient-to-r from-navy-950/90 to-navy-900/70"></div>
        <div class="relative z-10 flex flex-col justify-end h-full p-6">
          <h1 class="text-2xl font-bold text-white">{{ branchName() }}</h1>
          <p class="text-sm text-white/70 mt-1">{{ branchCity() }} — Detailed Analytics</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" appAnimateOnScroll>
        <app-kpi-card *ngFor="let kpi of kpis()"
          [label]="kpi.label" [value]="kpi.value" [previousValue]="kpi.previousValue"
          [format]="kpi.format" [trend]="kpi.trend" [trendPercentage]="kpi.trendPercentage"
          [icon]="kpi.icon" [accent]="kpi.accent" [sparklineData]="kpi.sparklineData || []">
        </app-kpi-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <app-chart-card appAnimateOnScroll title="Revenue vs Costs (30 Days)" [chartOptions]="revenueVsCostOptions()" [loading]="loading()" [height]="300"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Utility Cost Breakdown" [chartOptions]="utilityDonutOptions()" [loading]="loading()" [height]="300"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Labor Cost Trend" [chartOptions]="laborTrendOptions()" [loading]="loading()" [height]="300"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Daily Occupancy" [chartOptions]="occupancyLineOptions()" [loading]="loading()" [height]="300"></app-chart-card>
      </div>
    </div>
  `
})
export class BranchDetailComponent {
  private route = inject(ActivatedRoute);
  private financialService = inject(FinancialService);
  private utilityService = inject(UtilityService);
  private laborService = inject(LaborService);
  private kpiEngine = inject(KpiEngineService);
  private branchState = inject(BranchState);
  private destroyRef = inject(DestroyRef);
  private activeSub: Subscription | null = null;

  loading = signal(true);
  kpis = signal<KpiData[]>([]);
  branchName = signal('');
  branchCity = signal('');
  revenueVsCostOptions = signal<EChartsOption>({});
  utilityDonutOptions = signal<EChartsOption>({});
  laborTrendOptions = signal<EChartsOption>({});
  occupancyLineOptions = signal<EChartsOption>({});

  constructor() {
    effect(() => {
      const branches = this.branchState.branches();
      if (branches.length > 0) {
        untracked(() => this.loadBranchData());
      }
    });
    this.destroyRef.onDestroy(() => this.activeSub?.unsubscribe());
  }

  private loadBranchData(): void {
    this.activeSub?.unsubscribe();
    this.loading.set(true);
    const branchId = this.route.snapshot.paramMap.get('id') ?? 'br-001';
    const branch = this.branchState.branches().find(b => b.branchId === branchId);
    this.branchName.set(branch?.name ?? 'Property');
    this.branchCity.set(branch?.location?.city ?? '');

    this.activeSub = forkJoin({
      financials: this.financialService.getFinancialOps(branchId),
      utilities: this.utilityService.getUtilities(branchId),
      labor: this.laborService.getLaborRecords(branchId),
    }).subscribe(({ financials, utilities, labor }) => {
      const totalRooms = branch?.totalRooms ?? 200;
      const sorted = [...financials].sort((a, b) => a.date.localeCompare(b.date));
      const mid = Math.floor(sorted.length / 2);
      this.kpis.set(this.kpiEngine.buildKpiFromFinancials(sorted.slice(mid), sorted.slice(0, mid), totalRooms));

      const dates = sorted.map(f => { const d = new Date(f.date); return `${d.getMonth()+1}/${d.getDate()}`; });
      const chartStyle = { backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9', fontSize: 12 } };

      this.revenueVsCostOptions.set({
        tooltip: { trigger: 'axis', ...chartStyle },
        legend: { data: ['Revenue', 'Costs'], bottom: 0, textStyle: { color: '#94a3b8' } },
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: 'category', data: dates, axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: [
          { name: 'Revenue', type: 'line', data: sorted.map(f => f.dailyRevenue), smooth: true, lineStyle: { color: '#3b82f6', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.2)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } }, animationDuration: 1500 },
          { name: 'Costs', type: 'line', data: sorted.map(f => f.operationalCosts), smooth: true, lineStyle: { color: '#ef4444', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(239,68,68,0.1)' }, { offset: 1, color: 'rgba(239,68,68,0)' }] } }, animationDuration: 1800 },
        ],
      });

      const totalElec = utilities.reduce((s, u) => s + u.electricityCost, 0);
      const totalGas = utilities.reduce((s, u) => s + u.gasCost, 0);
      const totalWater = utilities.reduce((s, u) => s + u.waterCost, 0);

      this.utilityDonutOptions.set({
        tooltip: { trigger: 'item', ...chartStyle },
        legend: { bottom: 0, textStyle: { color: '#94a3b8' } },
        series: [{
          type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
          label: { show: false },
          data: [
            { value: totalElec, name: 'Electricity', itemStyle: { color: '#f59e0b' } },
            { value: totalGas, name: 'Gas', itemStyle: { color: '#3b82f6' } },
            { value: totalWater, name: 'Water', itemStyle: { color: '#06b6d4' } },
          ],
          animationType: 'scale', animationDuration: 1500,
        }],
      });

      const laborByDate = new Map<string, number>();
      for (const l of labor) { laborByDate.set(l.date, (laborByDate.get(l.date) ?? 0) + l.laborCost); }
      const laborDates = Array.from(laborByDate.keys()).sort();

      this.laborTrendOptions.set({
        tooltip: { trigger: 'axis', ...chartStyle },
        grid: { top: 20, right: 20, bottom: 20, left: 60 },
        xAxis: { type: 'category', data: laborDates.map(d => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; }), axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: [{ type: 'line', data: laborDates.map(d => laborByDate.get(d)), smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(139,92,246,0.2)' }, { offset: 1, color: 'rgba(139,92,246,0)' }] } }, lineStyle: { color: '#8b5cf6', width: 2 }, animationDuration: 1500 }],
      });

      this.occupancyLineOptions.set({
        tooltip: { trigger: 'axis', ...chartStyle },
        grid: { top: 20, right: 20, bottom: 20, left: 50 },
        xAxis: { type: 'category', data: dates, axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { color: '#94a3b8', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: [{ type: 'line', data: sorted.map(f => Math.round((f.roomsOccupied / totalRooms) * 100 * 10) / 10), smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.2)' }, { offset: 1, color: 'rgba(16,185,129,0)' }] } }, lineStyle: { color: '#10b981', width: 2 }, markLine: { data: [{ yAxis: 80, label: { formatter: 'Target 80%', color: '#94a3b8' }, lineStyle: { color: '#f59e0b', type: 'dashed' } }] }, animationDuration: 1500 }],
      });

      this.loading.set(false);
    });
  }
}
