import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { LaborService } from '../../core/services/labor.service';
import { FinancialService } from '../../core/services/financial.service';
import { BranchState } from '../../core/state/branch.state';
import { forkJoin, Subscription } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-staffing-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule, ChartCardComponent, KpiCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-7">
      <!-- Page Header -->
      <div class="page-header" appAnimateOnScroll animationClass="animate-blur-in">
        <div class="page-header-icon">
          <lucide-icon name="users" [size]="22"></lucide-icon>
        </div>
        <div>
          <h1>Labor Management</h1>
          <p>Staffing analytics and cost optimization</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="80"
           class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <app-kpi-card label="Total Labor Cost" [value]="totalLaborCost()" format="currency" [trend]="'flat'" [trendPercentage]="0" icon="wallet" accent="blue"></app-kpi-card>
        <app-kpi-card label="Labor Cost %" [value]="laborCostPct()" format="percentage" [trend]="laborCostPct() > 30 ? 'down' : 'up'" [trendPercentage]="2.1" icon="bar-chart-3" accent="violet"></app-kpi-card>
        <app-kpi-card label="Total Staff" [value]="totalStaff()" format="number" [trend]="'flat'" [trendPercentage]="0" icon="users" accent="emerald"></app-kpi-card>
      </div>

      <!-- Section: Department Analytics -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="building-2" [size]="14"></lucide-icon>
        Department Analytics
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card title="Staffing by Department" subtitle="Labor cost distribution" [chartOptions]="deptChartOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card title="Labor Cost Trend" subtitle="30-day rolling" [chartOptions]="trendOptions()" [loading]="loading()" [height]="320"></app-chart-card>
      </div>
    </div>
  `
})
export class StaffingOverviewComponent implements OnInit {
  private laborService = inject(LaborService);
  private financialService = inject(FinancialService);
  private branchState = inject(BranchState);
  private activeSub: Subscription | null = null;

  loading = signal(true);
  totalLaborCost = signal(0);
  laborCostPct = signal(0);
  totalStaff = signal(0);
  deptChartOptions = signal<EChartsOption>({});
  trendOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.activeSub?.unsubscribe();
    this.loading.set(true);
    const branchId = this.branchState.selectedBranchId() ?? undefined;
    this.activeSub = forkJoin({
      labor: this.laborService.getLaborRecords(branchId),
      financials: this.financialService.getFinancialOps(branchId),
    }).subscribe(({ labor, financials }) => {
      const totalLabor = labor.reduce((s: number, l: any) => s + l.laborCost, 0);
      const totalRevenue = financials.reduce((s: number, f: any) => s + f.dailyRevenue, 0);
      this.totalLaborCost.set(totalLabor);
      this.laborCostPct.set(totalRevenue > 0 ? (totalLabor / totalRevenue) * 100 : 0);

      const deptMap = new Map<string, { cost: number; staff: number }>();
      for (const l of labor) {
        const d = deptMap.get(l.department) ?? { cost: 0, staff: 0 };
        d.cost += l.laborCost; d.staff += l.staffCount;
        deptMap.set(l.department, d);
      }
      this.totalStaff.set(Array.from(deptMap.values()).reduce((s, d) => s + d.staff, 0));

      const depts = Array.from(deptMap.keys());
      const gradients = [
        ['#60a5fa', '#3b82f6'], ['#a78bfa', '#8b5cf6'], ['#f472b6', '#ec4899'],
        ['#fbbf24', '#f59e0b'], ['#34d399', '#10b981']
      ];
      const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 };

      this.deptChartOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 10, right: 20, bottom: 30, left: 120 },
        xAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        yAxis: { type: 'category', data: depts, axisLabel: { color: '#94a3b8' }, axisLine: { show: false } },
        series: [{ type: 'bar', data: depts.map((d, i) => ({ value: deptMap.get(d)!.cost, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: gradients[i % gradients.length][0] }, { offset: 1, color: gradients[i % gradients.length][1] }] }, borderRadius: [0, 6, 6, 0] } })), barWidth: 22, animationDuration: 1500, animationEasing: 'elasticOut' }],
      });

      const byDate = new Map<string, number>();
      for (const l of labor) { byDate.set(l.date, (byDate.get(l.date) ?? 0) + l.laborCost); }
      const laborDates = Array.from(byDate.keys()).sort();

      this.trendOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 20, right: 20, bottom: 20, left: 60 },
        xAxis: { type: 'category', data: laborDates.map(d => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; }), axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        series: [{ type: 'line', data: laborDates.map(d => byDate.get(d)), smooth: true, lineStyle: { color: '#8b5cf6', width: 2.5 }, symbol: 'circle', symbolSize: 4, itemStyle: { color: '#8b5cf6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(139,92,246,0.2)' }, { offset: 1, color: 'rgba(139,92,246,0)' }] } }, animationDuration: 1500, animationEasing: 'cubicOut' }],
      });

      this.loading.set(false);
    });
  }
}
