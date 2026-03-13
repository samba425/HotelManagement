import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prediction } from '../models/prediction.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getPredictions(branchId?: string): Observable<Prediction[]> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    return this.http.get<Prediction[]>(`${this.baseUrl}/predictions`, { params });
  }
}
