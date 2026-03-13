import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'branches/:id',
    loadComponent: () =>
      import('./features/branch-analytics/branch-detail.component').then(m => m.BranchDetailComponent),
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./features/sales-insights/sales-trends.component').then(m => m.SalesTrendsComponent),
  },
  {
    path: 'supply-chain',
    loadComponent: () =>
      import('./features/supply-chain/ingredient-tracker.component').then(m => m.IngredientTrackerComponent),
  },
  {
    path: 'labor',
    loadComponent: () =>
      import('./features/labor/staffing-overview.component').then(m => m.StaffingOverviewComponent),
  },
  {
    path: 'predictions',
    loadComponent: () =>
      import('./features/predictions/demand-forecast.component').then(m => m.DemandForecastComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
