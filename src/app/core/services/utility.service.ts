import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilityRecord } from '../models/utility.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UtilityService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getUtilities(branchId?: string, startDate?: string, endDate?: string): Observable<UtilityRecord[]> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<UtilityRecord[]>(`${this.baseUrl}/utilities`, { params });
  }
}
