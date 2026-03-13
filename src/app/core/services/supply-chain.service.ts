import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, Ingredient } from '../models/recipe.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplyChainService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getRecipes(dishId?: string): Observable<Recipe[]> {
    let params = new HttpParams();
    if (dishId) params = params.set('dishId', dishId);
    return this.http.get<Recipe[]>(`${this.baseUrl}/recipes`, { params });
  }

  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.baseUrl}/ingredients`);
  }
}
