import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { LucideAngularModule } from 'lucide-angular';
import { PredictionService } from '../../core/services/prediction.service';
import { Prediction } from '../../core/models/prediction.model';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-demand-forecast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChartCardComponent, AnimateOnScrollDirective, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div appAnimateOnScroll>
        <h1 class="text-2xl font-semibold text-text-primary">Predictions & Forecasts</h1>
        <p class="text-sm text-text-secondary mt-1">AI-powered demand forecasting and holiday preparedness</p>
      </div>

      <app-chart-card appAnimateOnScroll title="30-Day Demand Forecast" subtitle="Predicted occupancy with confidence band" [chartOptions]="forecastOptions()" [loading]="loading()" [height]="350"></app-chart-card>

      <div appAnimateOnScroll>
        <h2 class="text-lg font-semibold text-text-primary mb-4">Holiday Preparedness</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let pred of predictions()" class="glass-card p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <lucide-icon name="calendar-days" [size]="18" class="text-accent-primary"></lucide-icon>
                <span class="font-semibold text-text-primary">{{ pred.eventName }}</span>
              </div>
              <span class="text-xs px-2 py-1 rounded-full bg-accent-primary/10 text-accent-primary font-medium">
                {{ pred.eventDate | date:'MMM d, yyyy' }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center p-2 rounded-lg bg-surface-tertiary/50">
                <div class="text-lg font-bold text-accent-primary">{{ pred.predictedOccupancy }}%</div>
                <div class="text-[10px] text-text-secondary uppercase">Occupancy</div>
              </div>
              <div class="text-center p-2 rounded-lg bg-surface-tertiary/50">
                <div class="text-lg font-bold text-accent-success">{{ pred.predictedCovers }}</div>
                <div class="text-[10px] text-text-secondary uppercase">Covers</div>
              </div>
            </div>
            <div class="space-y-2 text-xs text-text-secondary">
              <div class="flex items-start gap-2">
                <lucide-icon name="trending-up" [size]="14" class="text-accent-warning mt-0.5 flex-shrink-0"></lucide-icon>
                <span>{{ pred.recommendations.inventoryBuffer }}</span>
              </div>
              <div class="flex items-start gap-2">
                <lucide-icon name="users" [size]="14" class="text-accent-primary mt-0.5 flex-shrink-0"></lucide-icon>
                <span>{{ pred.recommendations.staffingAction }}</span>
              </div>
              <div class="flex items-start gap-2">
                <lucide-icon name="zap" [size]="14" class="text-accent-danger mt-0.5 flex-shrink-0"></lucide-icon>
                <span>{{ pred.recommendations.utilityCostProjection }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DemandForecastComponent implements OnInit {
  private predictionService = inject(PredictionService);
  loading = signal(true);
  predictions = signal<Prediction[]>([]);
  forecastOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    this.predictionService.getPredictions().subscribe(predictions => {
      this.predictions.set(predictions);

      // Build a mock 30-day forecast line
      const days: string[] = [];
      const predicted: number[] = [];
      const upper: number[] = [];
      const lower: number[] = [];
      const now = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(now.getTime() + i * 86400000);
        days.push(`${d.getMonth()+1}/${d.getDate()}`);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const base = isWeekend ? 88 : 72;
        const val = base + Math.random() * 10;
        predicted.push(Math.round(val * 10) / 10);
        upper.push(Math.round((val + 5 + Math.random() * 3) * 10) / 10);
        lower.push(Math.round((val - 5 - Math.random() * 3) * 10) / 10);
      }

      this.forecastOptions.set({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9' } },
        legend: { data: ['Predicted', 'Upper Bound', 'Lower Bound'], bottom: 0, textStyle: { color: '#94a3b8' } },
        grid: { top: 20, right: 20, bottom: 40, left: 50 },
        xAxis: { type: 'category', data: days, axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', min: 50, max: 100, axisLabel: { color: '#94a3b8', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        series: [
          { name: 'Upper Bound', type: 'line', data: upper, lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(59,130,246,0.1)' }, stack: 'confidence', symbol: 'none' },
          { name: 'Lower Bound', type: 'line', data: lower, lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(59,130,246,0.1)' }, stack: 'confidence', symbol: 'none' },
          { name: 'Predicted', type: 'line', data: predicted, smooth: true, lineStyle: { color: '#3b82f6', width: 3 }, itemStyle: { color: '#3b82f6' }, animationDuration: 2000, animationEasing: 'cubicOut' },
        ],
      });

      this.loading.set(false);
    });
  }
}
