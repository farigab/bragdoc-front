import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ImportDataRequest {
  repositories: string[];
  startDate: string;
  endDate: string;
}

export interface ImportDataResponse {
  pullRequests?: number;
  issues?: number;
  commits?: number;
  repositories?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GithubImportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/github`;

  importRepositories(token?: string): Observable<string[]> {
    let params = new HttpParams();
    if (token) params = params.set('token', token);
    return this.http.post<string[]>(`${this.apiUrl}/import/repositories`, null, { params });
  }
}
