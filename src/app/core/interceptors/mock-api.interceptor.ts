import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, from, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

const ROUTE_MAP: Record<string, string> = {
  '/api/v1/branches': 'assets/mock-data/branches.json',
  '/api/v1/financial-operations': 'assets/mock-data/financial-operations.json',
  '/api/v1/restaurants': 'assets/mock-data/restaurants.json',
  '/api/v1/menu-items': 'assets/mock-data/menu-items.json',
  '/api/v1/daily-sales': 'assets/mock-data/daily-sales.json',
  '/api/v1/recipes': 'assets/mock-data/recipes.json',
  '/api/v1/ingredients': 'assets/mock-data/ingredients.json',
  '/api/v1/labor': 'assets/mock-data/labor.json',
  '/api/v1/utilities': 'assets/mock-data/utilities.json',
  '/api/v1/predictions': 'assets/mock-data/predictions.json',
  '/api/v1/chat': 'assets/mock-data/chat-responses.json',
};

function applyQueryParams(data: any[], params: Record<string, string>): any[] {
  let filtered = [...data];
  if (params['branchId']) {
    filtered = filtered.filter((item: any) => item.branchId === params['branchId']);
  }
  if (params['startDate'] && params['endDate']) {
    filtered = filtered.filter((item: any) => {
      if (!item.date) return true;
      return item.date >= params['startDate'] && item.date <= params['endDate'];
    });
  }
  if (params['dishId']) {
    filtered = filtered.filter((item: any) => item.dishId === params['dishId']);
  }
  if (params['restaurantId']) {
    filtered = filtered.filter((item: any) => item.restaurantId === params['restaurantId']);
  }
  return filtered;
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi) return next(req);

  const urlPath = req.url.split('?')[0];
  const mockPath = ROUTE_MAP[urlPath];

  if (!mockPath) return next(req);

  const params: Record<string, string> = {};
  req.params.keys().forEach(key => {
    params[key] = req.params.get(key) ?? '';
  });

  const mockDelay = Math.floor(Math.random() * 400) + 200;

  return from(fetch(mockPath).then(res => res.json())).pipe(
    map(data => {
      const filtered = Array.isArray(data) ? applyQueryParams(data, params) : data;
      return new HttpResponse({ status: 200, body: filtered });
    }),
    delay(mockDelay),
  );
};
