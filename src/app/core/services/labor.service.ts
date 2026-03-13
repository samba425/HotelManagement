import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaborRecord } from '../models/labor.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LaborService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getLaborRecords(branchId?: string, startDate?: string, endDate?: string): Observable<LaborRecord[]> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<LaborRecord[]>(`${this.baseUrl}/labor`, { params });
  }
}
