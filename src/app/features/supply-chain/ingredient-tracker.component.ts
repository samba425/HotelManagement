import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from '../../shared/components/chart-card/chart-card.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';
import { SupplyChainService } from '../../core/services/supply-chain.service';
import { forkJoin } from 'rxjs';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-ingredient-tracker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ChartCardComponent, DataTableComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-6">
      <div appAnimateOnScroll>
        <h1 class="text-2xl font-semibold text-text-primary">Supply Chain</h1>
        <p class="text-sm text-text-secondary mt-1">Ingredient consumption and procurement intelligence</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <app-chart-card appAnimateOnScroll title="Ingredient Cost by Category" subtitle="Treemap view" [chartOptions]="treemapOptions()" [loading]="loading()" [height]="350"></app-chart-card>
        <app-chart-card appAnimateOnScroll title="Cost Breakdown" subtitle="By category" [chartOptions]="costBreakdownOptions()" [loading]="loading()" [height]="350"></app-chart-card>
      </div>
      <app-data-table appAnimateOnScroll title="Procurement Forecast" [data]="tableData()" [columns]="tableColumns"></app-data-table>
    </div>
  `
})
export class IngredientTrackerComponent implements OnInit {
  private supplyChainService = inject(SupplyChainService);
  loading = signal(true);
  treemapOptions = signal<EChartsOption>({});
  costBreakdownOptions = signal<EChartsOption>({});
  tableData = signal<any[]>([]);
  tableColumns = [
    { key: 'name', label: 'Ingredient' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'costPerUnit', label: 'Cost/Unit' },
    { key: 'supplier', label: 'Supplier' },
  ];

  ngOnInit(): void {
    forkJoin({
      ingredients: this.supplyChainService.getIngredients(),
      recipes: this.supplyChainService.getRecipes(),
    }).subscribe(({ ingredients, recipes }) => {
      this.tableData.set(ingredients.map((i: any) => ({ ...i, costPerUnit: `$${i.costPerUnit.toFixed(2)}` })));

      const byCategory = new Map<string, { value: number; children: { name: string; value: number }[] }>();
      for (const ing of ingredients) {
        const cat = byCategory.get(ing.category) ?? { value: 0, children: [] };
        const cost = ing.costPerUnit * 100;
        cat.value += cost;
        cat.children.push({ name: ing.name, value: cost });
        byCategory.set(ing.category, cat);
      }

      const catColors: Record<string, string> = { Proteins: '#ef4444', Seafood: '#3b82f6', Dairy: '#f59e0b', Produce: '#10b981', Grains: '#8b5cf6', Spices: '#ec4899', Beverages: '#06b6d4' };

      this.treemapOptions.set({
        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9' } },
        series: [{ type: 'treemap', data: Array.from(byCategory.entries()).map(([name, data]) => ({ name, value: data.value, children: data.children, itemStyle: { color: catColors[name] ?? '#64748b', borderColor: 'rgba(0,0,0,0.1)' } })), label: { color: '#fff', fontSize: 11 }, breadcrumb: { show: false }, animationDuration: 1500 }],
      });

      const categories = Array.from(byCategory.keys());
      this.costBreakdownOptions.set({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'transparent', textStyle: { color: '#f1f5f9' } },
        grid: { top: 10, right: 20, bottom: 30, left: 100 },
        xAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: '#334155', type: 'dashed' } } },
        yAxis: { type: 'category', data: categories, axisLabel: { color: '#94a3b8' }, axisLine: { show: false } },
        series: [{ type: 'bar', data: categories.map(c => ({ value: byCategory.get(c)!.value, itemStyle: { color: catColors[c] ?? '#64748b', borderRadius: [0, 6, 6, 0] } })), barWidth: 20, animationDuration: 1500 }],
      });

      this.loading.set(false);
    });
  }
}
