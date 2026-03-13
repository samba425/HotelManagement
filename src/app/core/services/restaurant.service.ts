import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant, MenuItem, DailySale } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getRestaurants(branchId?: string): Observable<Restaurant[]> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants`, { params });
  }

  getMenuItems(restaurantId?: string): Observable<MenuItem[]> {
    let params = new HttpParams();
    if (restaurantId) params = params.set('restaurantId', restaurantId);
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menu-items`, { params });
  }

  getDailySales(dishId?: string, startDate?: string, endDate?: string): Observable<DailySale[]> {
    let params = new HttpParams();
    if (dishId) params = params.set('dishId', dishId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<DailySale[]>(`${this.baseUrl}/daily-sales`, { params });
  }
}
