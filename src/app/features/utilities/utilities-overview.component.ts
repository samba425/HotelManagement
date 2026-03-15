import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { UtilityService } from '../../core/services/utility.service';
import { BranchState } from '../../core/state/branch.state';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-utilities-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule, ChartCardComponent, KpiCardComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-7">
      <!-- Page Header -->
      <div class="page-header" appAnimateOnScroll animationClass="animate-blur-in">
        <div class="page-header-icon">
          <lucide-icon name="zap" [size]="22"></lucide-icon>
        </div>
        <div>
          <h1>Utilities</h1>
          <p>Energy consumption, cost tracking, and efficiency analysis</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="80"
           class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <app-kpi-card label="Total Electricity" [value]="totalElectricity()" format="currency" trend="up" [trendPercentage]="3.2" icon="zap" accent="amber"></app-kpi-card>
        <app-kpi-card label="Total Gas" [value]="totalGas()" format="currency" trend="down" [trendPercentage]="1.5" icon="flame" accent="blue"></app-kpi-card>
        <app-kpi-card label="Total Water" [value]="totalWater()" format="currency" trend="flat" [trendPercentage]="0.4" icon="droplets" accent="cyan"></app-kpi-card>
      </div>

      <!-- Section: Cost Analysis -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="pie-chart" [size]="14"></lucide-icon>
        Cost Breakdown
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card title="Utility Cost Distribution" subtitle="Electricity vs Gas vs Water" [chartOptions]="costDistOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card title="Utility Cost by Branch" subtitle="Monthly average" [chartOptions]="branchUtilOptions()" [loading]="loading()" [height]="320"></app-chart-card>
      </div>

      <!-- Section: Trends -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="activity" [size]="14"></lucide-icon>
        Consumption Trends
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card title="Electricity Usage Trend" subtitle="Daily kWh consumption" [chartOptions]="elecTrendOptions()" [loading]="loading()" [height]="320"></app-chart-card>
        <app-chart-card title="Gas & Water Trend" subtitle="Daily usage" [chartOptions]="gasWaterTrendOptions()" [loading]="loading()" [height]="320"></app-chart-card>
      </div>
    </div>
  `
})
export class UtilitiesOverviewComponent implements OnInit {
  private utilityService = inject(UtilityService);
  private branchState = inject(BranchState);

  loading = signal(true);
  totalElectricity = signal(0);
  totalGas = signal(0);
  totalWater = signal(0);

  costDistOptions = signal<EChartsOption>({});
  branchUtilOptions = signal<EChartsOption>({});
  elecTrendOptions = signal<EChartsOption>({});
  gasWaterTrendOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    const branchId = this.branchState.selectedBranchId() ?? undefined;
    this.utilityService.getUtilities(branchId).subscribe(utilities => {
      const totalElec = utilities.reduce((s, u) => s + u.electricityCost, 0);
      const totalGas = utilities.reduce((s, u) => s + u.gasCost, 0);
      const totalWater = utilities.reduce((s, u) => s + u.waterCost, 0);
      this.totalElectricity.set(totalElec);
      this.totalGas.set(totalGas);
      this.totalWater.set(totalWater);

      const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 };

      // Cost distribution donut
      this.costDistOptions.set({
        tooltip: { trigger: 'item', ...tooltipStyle, formatter: (p: any) => `${p.name}<br/>$${(p.value).toLocaleString()} (${p.percent}%)` },
        legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
        series: [{
          type: 'pie', radius: ['42%', '72%'], center: ['50%', '45%'],
          label: { show: false },
          data: [
            { value: totalElec, name: 'Electricity', itemStyle: { color: '#f59e0b' } },
            { value: totalGas, name: 'Gas', itemStyle: { color: '#3b82f6' } },
            { value: totalWater, name: 'Water', itemStyle: { color: '#06b6d4' } },
          ],
          emphasis: { scaleSize: 8 },
          animationType: 'scale', animationDuration: 1500,
        }],
      });

      // Utility cost by branch
      const branches = this.branchState.branches();
      const byBranch = new Map<string, number>();
      for (const u of utilities) {
        byBranch.set(u.branchId, (byBranch.get(u.branchId) ?? 0) + u.electricityCost + u.gasCost + u.waterCost);
      }
      const branchNames = branches.map(b => b.name);
      const branchCosts = branches.map(b => byBranch.get(b.branchId) ?? 0);
      const gradients = [
        ['#fbbf24', '#f59e0b'], ['#60a5fa', '#3b82f6'], ['#22d3ee', '#06b6d4'],
        ['#a78bfa', '#8b5cf6'], ['#34d399', '#10b981'], ['#f472b6', '#ec4899']
      ];

      this.branchUtilOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle, formatter: (params: any) => { const p = params[0]; return `<b>${p.name}</b><br/>Total: $${(p.value).toLocaleString()}`; } },
        grid: { top: 10, right: 40, bottom: 10, left: 140 },
        xAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 10, formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        yAxis: { type: 'category', data: branchNames, inverse: true, axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } },
        series: [{ type: 'bar', data: branchCosts.map((v, i) => ({ value: v, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: gradients[i % gradients.length][0] }, { offset: 1, color: gradients[i % gradients.length][1] }] }, borderRadius: [0, 6, 6, 0] } })), barWidth: 22, animationDuration: 1500, animationEasing: 'elasticOut' }],
      });

      // Electricity trend
      const byDate = new Map<string, { elec: number; gas: number; water: number }>();
      for (const u of utilities) {
        const d = byDate.get(u.date) ?? { elec: 0, gas: 0, water: 0 };
        d.elec += u.electricityKwh;
        d.gas += u.gasUnits;
        d.water += u.waterGallons;
        byDate.set(u.date, d);
      }
      const dates = Array.from(byDate.keys()).sort();
      const shortDates = dates.map(d => { const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; });

      this.elecTrendOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 20, right: 20, bottom: 20, left: 60 },
        xAxis: { type: 'category', data: shortDates, axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `${(v/1000).toFixed(0)}K kWh` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        series: [{
          type: 'line', data: dates.map(d => byDate.get(d)!.elec), smooth: true,
          lineStyle: { color: '#f59e0b', width: 2.5 },
          symbol: 'circle', symbolSize: 4, itemStyle: { color: '#f59e0b' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.2)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } },
          animationDuration: 1500, animationEasing: 'cubicOut',
        }],
      });

      // Gas & water trend
      this.gasWaterTrendOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        legend: { data: ['Gas (units)', 'Water (gal)'], bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
        grid: { top: 20, right: 20, bottom: 40, left: 60 },
        xAxis: { type: 'category', data: shortDates, axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        series: [
          {
            name: 'Gas (units)', type: 'bar', data: dates.map(d => byDate.get(d)!.gas),
            itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: '#3b82f6' }] }, borderRadius: [4, 4, 0, 0] },
            barWidth: '35%', animationDuration: 1500, animationEasing: 'elasticOut',
          },
          {
            name: 'Water (gal)', type: 'line', data: dates.map(d => byDate.get(d)!.water), smooth: true,
            lineStyle: { color: '#06b6d4', width: 2 },
            symbol: 'circle', symbolSize: 4, itemStyle: { color: '#06b6d4' },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(6,182,212,0.15)' }, { offset: 1, color: 'rgba(6,182,212,0)' }] } },
            animationDuration: 1800,
          },
        ],
      });

      this.loading.set(false);
    });
  }
}
