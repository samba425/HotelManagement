import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
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
  imports: [CommonModule, LucideAngularModule, ChartCardComponent, DataTableComponent, AnimateOnScrollDirective],
  template: `
    <div class="space-y-7">
      <!-- Page Header -->
      <div class="page-header" appAnimateOnScroll animationClass="animate-blur-in">
        <div class="page-header-icon">
          <lucide-icon name="package" [size]="22"></lucide-icon>
        </div>
        <div>
          <h1>Supply Chain</h1>
          <p>Ingredient consumption and procurement intelligence</p>
        </div>
      </div>

      <!-- Summary Stats -->
      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="70"
           class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="stat-pill">
          <div class="stat-pill-icon bg-red-500/10 text-red-400">
            <lucide-icon name="beef" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ totalIngredients() }}</div>
            <div class="stat-pill-label">Ingredients</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-icon bg-blue-500/10 text-blue-400">
            <lucide-icon name="tags" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ totalCategories() }}</div>
            <div class="stat-pill-label">Categories</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-icon bg-amber-500/10 text-amber-400">
            <lucide-icon name="truck" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ totalSuppliers() }}</div>
            <div class="stat-pill-label">Suppliers</div>
          </div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-icon bg-emerald-500/10 text-emerald-400">
            <lucide-icon name="book-open" [size]="16"></lucide-icon>
          </div>
          <div>
            <div class="stat-pill-value">{{ totalRecipes() }}</div>
            <div class="stat-pill-label">Recipes</div>
          </div>
        </div>
      </div>

      <!-- Section: Cost Analysis -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="bar-chart-3" [size]="14"></lucide-icon>
        Cost Analysis
      </div>

      <div appAnimateOnScroll [stagger]="true" [staggerDelay]="100"
           class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <app-chart-card title="Ingredient Cost by Category" subtitle="Treemap view" [chartOptions]="treemapOptions()" [loading]="loading()" [height]="350"></app-chart-card>
        <app-chart-card title="Cost Breakdown" subtitle="By category" [chartOptions]="costBreakdownOptions()" [loading]="loading()" [height]="350"></app-chart-card>
      </div>

      <!-- Section: Procurement -->
      <div class="section-label" appAnimateOnScroll>
        <lucide-icon name="clipboard-list" [size]="14"></lucide-icon>
        Procurement Forecast
      </div>

      <div appAnimateOnScroll>
        <app-data-table title="Procurement Forecast" [data]="tableData()" [columns]="tableColumns"></app-data-table>
      </div>
    </div>
  `
})
export class IngredientTrackerComponent implements OnInit {
  private supplyChainService = inject(SupplyChainService);
  loading = signal(true);
  treemapOptions = signal<EChartsOption>({});
  costBreakdownOptions = signal<EChartsOption>({});
  tableData = signal<any[]>([]);

  totalIngredients = signal(0);
  totalCategories = signal(0);
  totalSuppliers = signal(0);
  totalRecipes = signal(0);

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
      this.totalIngredients.set(ingredients.length);
      this.totalRecipes.set(recipes.length);
      this.totalCategories.set(new Set(ingredients.map((i: any) => i.category)).size);
      this.totalSuppliers.set(new Set(ingredients.map((i: any) => i.supplier)).size);

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

      const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(129,140,248,0.2)', textStyle: { color: '#f1f5f9' }, borderRadius: 10 };

      this.treemapOptions.set({
        tooltip: tooltipStyle,
        series: [{ type: 'treemap', data: Array.from(byCategory.entries()).map(([name, data]) => ({ name, value: data.value, children: data.children, itemStyle: { color: catColors[name] ?? '#64748b', borderColor: 'rgba(0,0,0,0.1)' } })), label: { color: '#fff', fontSize: 11 }, breadcrumb: { show: false }, animationDuration: 1500, animationEasing: 'cubicOut' }],
      });

      const categories = Array.from(byCategory.keys());
      this.costBreakdownOptions.set({
        tooltip: { trigger: 'axis', ...tooltipStyle },
        grid: { top: 10, right: 20, bottom: 30, left: 100 },
        xAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => `$${(v/1000).toFixed(0)}K` }, splitLine: { lineStyle: { color: 'rgba(51,65,85,0.5)', type: 'dashed' } } },
        yAxis: { type: 'category', data: categories, axisLabel: { color: '#94a3b8' }, axisLine: { show: false } },
        series: [{ type: 'bar', data: categories.map(c => ({ value: byCategory.get(c)!.value, itemStyle: { color: catColors[c] ?? '#64748b', borderRadius: [0, 6, 6, 0] } })), barWidth: 20, animationDuration: 1500, animationEasing: 'elasticOut' }],
      });

      this.loading.set(false);
    });
  }
}
