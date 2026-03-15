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
    <div class="space-y-7">
      <!-- Page Header -->
      <div class="page-header" appAnimateOnScroll animationClass="animate-blur-in">
        <div class="page-header-icon">
          <lucide-icon name="brain" [size]="22"></lucide-icon>
        </div>
        <div>
          <h1>Predictions & Forecasts</h1>
          <p>AI-powered demand forecasting and holiday preparedness</p>
        </div>
      </div>

      <!-- Forecast Chart -->
      <div appAnimateOnScroll animationClass="animate-fade-scale">
        <app-chart-card
          title="30-Day Demand Forecast"
          subtitle="Predicted occupancy with confidence band"
          [chartOptions]="forecastOptions()"
          [loading]="loading()"
          [height]="360">
        </app-chart-card>
      </div>

      <!-- Section: Holiday Preparedness -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="calendar-heart" [size]="14"></lucide-icon>
        Holiday Preparedness
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="120"
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let pred of predictions(); let i = index" class="holiday-card" [attr.data-index]="i">
          <div class="holiday-card-gradient" [attr.data-variant]="i % 3"></div>
          <div class="holiday-card-content">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="holiday-icon-wrap" [attr.data-variant]="i % 3">
                  <lucide-icon name="calendar-days" [size]="18"></lucide-icon>
                </div>
                <div>
                  <div class="font-semibold text-text-primary text-[15px]">{{ pred.eventName }}</div>
                  <div class="text-[11px] text-text-muted mt-0.5">{{ pred.eventDate | date:'MMM d, yyyy' }}</div>
                </div>
              </div>
            </div>

            <!-- Occupancy gauge -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] font-medium text-text-secondary">Predicted Occupancy</span>
                <span class="text-[13px] font-bold" [class]="pred.predictedOccupancy >= 90 ? 'text-red-400' : 'text-emerald-400'">{{ pred.predictedOccupancy }}%</span>
              </div>
              <div class="occupancy-bar-bg">
                <div class="occupancy-bar-fill" [style.width.%]="pred.predictedOccupancy"
                     [class]="pred.predictedOccupancy >= 90 ? 'bg-gradient-to-r from-amber-400 to-red-400' : 'bg-gradient-to-r from-emerald-400 to-cyan-400'">
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="holiday-metric">
                <lucide-icon name="users" [size]="14" class="text-blue-400"></lucide-icon>
                <div>
                  <div class="text-[15px] font-bold text-text-primary">{{ pred.predictedCovers }}</div>
                  <div class="text-[10px] text-text-muted uppercase">Covers</div>
                </div>
              </div>
              <div class="holiday-metric">
                <lucide-icon name="thermometer" [size]="14" class="text-amber-400"></lucide-icon>
                <div>
                  <div class="text-[15px] font-bold text-text-primary">{{ pred.predictedOccupancy >= 90 ? 'High' : 'Medium' }}</div>
                  <div class="text-[10px] text-text-muted uppercase">Demand</div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="space-y-2.5 pt-3 border-t border-border-default/50">
              <div class="holiday-rec">
                <div class="holiday-rec-icon bg-amber-500/10">
                  <lucide-icon name="trending-up" [size]="13" class="text-amber-400"></lucide-icon>
                </div>
                <span class="text-[12px] text-text-secondary leading-snug">{{ pred.recommendations.inventoryBuffer }}</span>
              </div>
              <div class="holiday-rec">
                <div class="holiday-rec-icon bg-blue-500/10">
                  <lucide-icon name="users" [size]="13" class="text-blue-400"></lucide-icon>
                </div>
                <span class="text-[12px] text-text-secondary leading-snug">{{ pred.recommendations.staffingAction }}</span>
              </div>
              <div class="holiday-rec">
                <div class="holiday-rec-icon bg-red-500/10">
                  <lucide-icon name="zap" [size]="13" class="text-red-400"></lucide-icon>
                </div>
                <span class="text-[12px] text-text-secondary leading-snug">{{ pred.recommendations.utilityCostProjection }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .holiday-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(20px) saturate(1.2);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.4s ease;
    }

    .holiday-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      border-color: rgba(129, 140, 248, 0.15);
    }

    .holiday-card-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    .holiday-card-gradient[data-variant="0"] {
      background: linear-gradient(90deg, #f59e0b, #ef4444);
    }
    .holiday-card-gradient[data-variant="1"] {
      background: linear-gradient(90deg, #10b981, #06b6d4);
    }
    .holiday-card-gradient[data-variant="2"] {
      background: linear-gradient(90deg, #8b5cf6, #ec4899);
    }

    .holiday-card-content {
      position: relative;
      z-index: 1;
      padding: 22px;
    }

    .holiday-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .holiday-icon-wrap[data-variant="0"] {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .holiday-icon-wrap[data-variant="1"] {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .holiday-icon-wrap[data-variant="2"] {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .occupancy-bar-bg {
      height: 6px;
      border-radius: 3px;
      background: var(--surface-tertiary);
      overflow: hidden;
    }

    .occupancy-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .holiday-metric {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--glass-border);
    }

    .holiday-rec {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .holiday-rec-icon {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `]
})
export class DemandForecastComponent implements OnInit {
  private predictionService = inject(PredictionService);
  loading = signal(true);
  predictions = signal<Prediction[]>([]);
  forecastOptions = signal<EChartsOption>({});

  ngOnInit(): void {
    this.predictionService.getPredictions().subscribe(predictions => {
      this.predictions.set(predictions);

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
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 },
        legend: { data: ['Predicted', 'Upper Bound', 'Lower Bound'], bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
        grid: { top: 20, right: 20, bottom: 40, left: 50 },
        xAxis: { type: 'category', data: days, axisLabel: { color: '#94a3b8', fontSize: 10 } },
        yAxis: { type: 'value', min: 50, max: 100, axisLabel: { color: '#94a3b8', formatter: '{value}%' }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        series: [
          { name: 'Upper Bound', type: 'line', data: upper, lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(59,130,246,0.08)' }, stack: 'confidence', symbol: 'none' },
          { name: 'Lower Bound', type: 'line', data: lower, lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(59,130,246,0.08)' }, stack: 'confidence', symbol: 'none' },
          { name: 'Predicted', type: 'line', data: predicted, smooth: true, lineStyle: { color: '#3b82f6', width: 3 }, itemStyle: { color: '#3b82f6' }, symbol: 'circle', symbolSize: 4, animationDuration: 2000, animationEasing: 'cubicOut' },
        ],
      });

      this.loading.set(false);
    });
  }
}
