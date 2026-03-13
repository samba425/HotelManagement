import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../models/branch.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.baseUrl}/branches`);
  }

  getBranchById(branchId: string): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.baseUrl}/branches`, {
      params: { branchId }
    });
  }
}
