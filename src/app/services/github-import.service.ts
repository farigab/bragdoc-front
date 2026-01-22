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

  importPullRequests(repository: string, token?: string): Observable<unknown> {
    let params = new HttpParams().set('repository', repository);
    if (token) params = params.set('token', token);
    return this.http.post(`${this.apiUrl}/import/pull-requests`, null, { params });
  }

  importIssues(repository: string, token?: string): Observable<unknown> {
    let params = new HttpParams().set('repository', repository);
    if (token) params = params.set('token', token);
    return this.http.post(`${this.apiUrl}/import/issues`, null, { params });
  }

  importCommits(repository: string | undefined, minChanges: number = 1, token?: string): Observable<unknown> {
    let params = new HttpParams().set('minChanges', String(minChanges));
    if (repository) params = params.set('repository', repository);
    if (token) params = params.set('token', token);
    return this.http.post(`${this.apiUrl}/import/commits`, null, { params });
  }

  importRepositories(token?: string): Observable<string[]> {
    let params = new HttpParams();
    if (token) params = params.set('token', token);
    return this.http.post<string[]>(`${this.apiUrl}/import/repositories`, null, { params });
  }

  importData(request: ImportDataRequest): Observable<ImportDataResponse> {
    return this.http.post<ImportDataResponse>(`${this.apiUrl}/import`, request);
  }
}
