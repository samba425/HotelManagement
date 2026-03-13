import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialOperation } from '../models/financial.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getFinancialOps(branchId?: string, startDate?: string, endDate?: string): Observable<FinancialOperation[]> {
    let params = new HttpParams();
    if (branchId) params = params.set('branchId', branchId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<FinancialOperation[]>(`${this.baseUrl}/financial-operations`, { params });
  }
}
