import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Achievement } from '../models/achievement.model';
import {
  AICustomSummaryRequest,
  AIGitHubAnalysis,
  AISummaryReport,
  TimelineReport
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  // State management with signals
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  getTimeline(): Observable<TimelineReport> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<TimelineReport>(`${this.apiUrl}/timeline`).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (err) => {
          this.errorSignal.set(err.message);
          this.loadingSignal.set(false);
        }
      })
    );
  }

  exportAll(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/export`);
  }

  getAISummary(
    reportType: string = 'executive',
    category?: string,
    startDate?: string,
    endDate?: string
  ): Observable<AISummaryReport> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams().set('reportType', reportType);

    if (category) {
      params = params.set('category', category);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<AISummaryReport>(`${this.apiUrl}/ai-summary`, { params }).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (err) => {
          this.errorSignal.set(err.message);
          this.loadingSignal.set(false);
        }
      })
    );
  }

  getAIGitHubAnalysis(): Observable<AIGitHubAnalysis> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<AIGitHubAnalysis>(`${this.apiUrl}/ai-github-analysis`).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (err) => {
          this.errorSignal.set(err.message);
          this.loadingSignal.set(false);
        }
      })
    );
  }

  getAICustomSummary(request: AICustomSummaryRequest): Observable<AISummaryReport> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AISummaryReport>(
      `${this.apiUrl}/ai-summary/custom`,
      request
    ).pipe(
      tap({
        next: () => this.loadingSignal.set(false),
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'An unknown error occurred';
          this.errorSignal.set(message);
          this.loadingSignal.set(false);
        }
      })
    );
  }
}
