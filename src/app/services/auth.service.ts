import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, finalize, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggingService } from './logging.service';
import { NotificationService } from './notification.service';

export interface AuthUser {
  readonly id: number;
  readonly login: string;
  readonly name: string;
  readonly avatarUrl?: string;
  readonly hasGitHubToken: boolean;
}

interface UserCacheEntry {
  readonly request$: Observable<AuthUser>;
  readonly timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggingService);
  private readonly notify = inject(NotificationService);

  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  readonly user = signal<AuthUser | null>(null);
  readonly isLoading = signal(false);
  readonly lastError = signal<string | null>(null);

  private userCache: UserCacheEntry | null = null;

  loginWithGithub(): void {
    const redirect = `${location.origin}/auth-callback`;
    const url = `${environment.apiUrl}/auth/github?redirect=${encodeURIComponent(redirect)}`;
    window.location.href = url;
  }

  saveToken(token: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/github/token`, { token }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  clearToken(): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/github/token`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  logout(): void {
    this.isLoading.set(true);
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {})
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.clearUserState();
          this.router.navigate(['/login']);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Logout failed';
          this.logger.error('Logout error', { err });
          this.notify.error('Logout error', message);
          this.clearUserState();
          this.router.navigate(['/login']);
        }
      });
  }

  loadUser(forceRefresh = false): Observable<AuthUser> {
    if (!forceRefresh && this.userCache && this.isCacheValid()) {
      return this.userCache.request$;
    }

    this.invalidateCache();

    const request$ = this.http.get<AuthUser>(`${environment.apiUrl}/user`).pipe(
      tap(user => {
        this.user.set(user);
        this.lastError.set(null);
      }),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to load user';
        this.lastError.set(message);
        this.logger.error('Load user error', { error });
        this.invalidateCache();
        throw error;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.userCache = {
      request$,
      timestamp: Date.now()
    };

    return request$;
  }

  checkSession(): Observable<boolean> {
    if (this.user() && this.isCacheValid()) {
      return of(true);
    }

    this.isLoading.set(true);

    return this.loadUser().pipe(
      map(() => true),
      catchError(() => {
        this.clearUserState();
        return of(false);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  invalidateCache(): void {
    this.userCache = null;
  }

  private isCacheValid(): boolean {
    if (!this.userCache) return false;

    const age = Date.now() - this.userCache.timestamp;
    return age < this.CACHE_TTL_MS;
  }

  private clearUserState(): void {
    this.user.set(null);
    this.lastError.set(null);
    this.invalidateCache();
  }
}
