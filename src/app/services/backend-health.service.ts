import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, tap, switchMap, of, Observable, timer, map, timeout, mergeMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BackendStatus {
  readonly isAvailable: boolean;
  readonly isWarming: boolean;
  readonly lastCheck: Date;
  readonly failedAttempts: number;
  readonly estimatedWaitTime?: number;
  readonly lastError?: string;
}

@Injectable({ providedIn: 'root' })
export class BackendHealthService {
  private readonly http = inject(HttpClient);
  private readonly healthUrl = `${environment.apiUrl}/health`;

  readonly MAX_RETRY_ATTEMPTS = 10;
  private readonly FAST_TIMEOUT_MS = 2000;
  private readonly RETRY_DELAY_MS = 3000;
  private readonly LONG_TIMEOUT_MS = 30000;
  private readonly HIBERNATION_ERROR_CODES = [503, 504, 502, 0];

  private checkStartTime = 0;

  readonly status = signal<BackendStatus>({
    isAvailable: false,
    isWarming: false,
    lastCheck: new Date(),
    failedAttempts: 0,
    estimatedWaitTime: undefined,
    lastError: undefined
  });

  readonly isHealthy = computed(() => this.status().isAvailable);
  readonly isLoading = computed(() => !this.status().isAvailable && this.status().failedAttempts < this.MAX_RETRY_ATTEMPTS);
  readonly hasFailed = computed(() => this.status().failedAttempts >= this.MAX_RETRY_ATTEMPTS && !this.status().isAvailable);


  checkHealth(): Observable<void> {
    this.checkStartTime = Date.now();

    this.updateStatus({
      isWarming: false,
      failedAttempts: 0,
      lastError: undefined
    });

    return this.quickPing().pipe(
      switchMap((isHibernating) => {
        // Se o quickPing respondeu rápido (não está hibernando), já marca como disponível
        if (!isHibernating) {
          console.log('[Health Check] Backend available (quick ping succeeded)');
          this.updateStatus({
            isAvailable: true,
            isWarming: false,
            lastCheck: new Date(),
            failedAttempts: 0,
            estimatedWaitTime: undefined,
            lastError: undefined
          });
          return of(void 0);
        }

        console.log('[Health Check] Backend hibernating - initiating warm-up sequence');
        this.updateStatus({
          isWarming: true,
          failedAttempts: 0,
          estimatedWaitTime: 60
        });
        return this.attemptHealthCheck(0);
      }),
      catchError((error) => {
        console.error('[Health Check] Critical error:', error);
        this.updateStatus({
          isAvailable: false,
          isWarming: false,
          lastError: 'Failed to connect to backend',
          failedAttempts: this.MAX_RETRY_ATTEMPTS
        });
        return of(void 0);
      })
    );
  }

  private quickPing(): Observable<boolean> {
    return this.http.get<{ status: string }>(this.healthUrl, {
      headers: { 'X-Health-Check': 'quick-ping' }
    }).pipe(
      timeout(this.FAST_TIMEOUT_MS),
      map(() => {
        console.log('[Health Check] Quick ping successful');
        return false;
      }),
      catchError((error) => {
        const isTimeout = error.name === 'TimeoutError';
        console.log(`[Health Check] Quick ping ${isTimeout ? 'timeout' : 'failed'} - assuming hibernation`);
        return of(true);
      })
    );
  }

  /**
   * Tenta fazer health check com retry logic
   */
  private attemptHealthCheck(attemptNumber: number): Observable<void> {
    const elapsedSeconds = Math.floor((Date.now() - this.checkStartTime) / 1000);

    return this.http.get<{ status: string }>(this.healthUrl, {
      headers: { 'X-Health-Check': 'full-check' }
    }).pipe(
      timeout(this.LONG_TIMEOUT_MS),
      tap(() => {
        const totalTime = Math.floor((Date.now() - this.checkStartTime) / 1000);
        console.log(`[Health Check] ✓ Backend available after ${totalTime}s (attempt ${attemptNumber + 1})`);

        this.updateStatus({
          isAvailable: true,
          isWarming: false,
          lastCheck: new Date(),
          failedAttempts: 0,
          estimatedWaitTime: undefined,
          lastError: undefined
        });
      }),
      map(() => void 0),
      catchError((error) => {
        const status = error?.status ?? 0;
        const isTimeout = error.name === 'TimeoutError';
        const newAttemptNumber = attemptNumber + 1;

        console.log(
          `[Health Check] ✗ ${isTimeout ? 'Timeout' : `Status ${status}`} ` +
          `after ${elapsedSeconds}s (attempt ${newAttemptNumber}/${this.MAX_RETRY_ATTEMPTS})`
        );

        const averageWarmupTime = 60;
        const estimatedWaitTime = Math.max(5, averageWarmupTime - elapsedSeconds);

        this.updateStatus({
          isWarming: true,
          failedAttempts: newAttemptNumber,
          lastCheck: new Date(),
          estimatedWaitTime,
          lastError: isTimeout ? 'Connection timeout' : `HTTP ${status}`
        });

        if (newAttemptNumber < this.MAX_RETRY_ATTEMPTS &&
          (this.HIBERNATION_ERROR_CODES.includes(status) || isTimeout)) {

          console.log(`[Health Check] Retrying in ${this.RETRY_DELAY_MS}ms...`);

          return timer(this.RETRY_DELAY_MS).pipe(
            mergeMap(() => this.attemptHealthCheck(newAttemptNumber))
          );
        }

        console.error('[Health Check] Max attempts reached - giving up');
        this.updateStatus({
          isAvailable: false,
          isWarming: false,
          lastCheck: new Date(),
          failedAttempts: newAttemptNumber,
          estimatedWaitTime: undefined,
          lastError: 'Max retry attempts exceeded'
        });

        return of(void 0);
      })
    );
  }

  reset(): void {
    this.checkStartTime = 0;
    this.status.set({
      isAvailable: false,
      isWarming: false,
      lastCheck: new Date(),
      failedAttempts: 0,
      estimatedWaitTime: undefined,
      lastError: undefined
    });
  }

  private updateStatus(partial: Partial<BackendStatus>): void {
    this.status.update(current => ({
      ...current,
      ...partial,
      lastCheck: new Date()
    }));
  }
}
