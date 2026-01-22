import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  readonly user = signal<AuthUser | null>(null);
  readonly router = inject(Router);

  private readonly logger = inject(LoggingService);
  private readonly notify = inject(NotificationService);
  private readonly http = inject(HttpClient);

  private refreshInProgress = signal<boolean>(false);

  loginWithGithub(): void {
    const redirect = `${location.origin}/auth-callback`;
    window.location.href = `${environment.apiUrl}/auth/github?redirect=${encodeURIComponent(redirect)}`;
  }

  saveToken(token: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/github/token`, { token });
  }

  clearToken(): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/github/token`);
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {})
      .subscribe({
        next: () => {
          this.user.set(null);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.logger.error('Erro no logout', { err });
          this.notify.error('Erro no logout', String((err as any)?.message ?? err));
          this.user.set(null);
          this.router.navigate(['/login']);
        }
      });
  }

  loadUser(): void {
    this.http.get<AuthUser>(`${environment.apiUrl}/user`)
      .subscribe(user => {
        this.user.set(user);
      });
  }

  checkSession(): Observable<boolean> {
    if (this.user()) {
      return of(true);
    }

    return this.http
      .get<AuthUser>(`${environment.apiUrl}/user`, { withCredentials: true })
      .pipe(
        tap(user => this.user.set(user)),
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Solicita um novo token JWT usando o refresh token
   */
  refreshToken(): Observable<boolean> {
    if (this.refreshInProgress()) {
      return of(false);
    }

    this.refreshInProgress.set(true);

    return this.http
      .post(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        map(() => {
          this.refreshInProgress.set(false);
          return true;
        }),
        catchError((err) => {
          this.refreshInProgress.set(false);
          this.logger.error('Erro ao renovar token', { err });

          // Se o refresh falhar, desloga o usuário
          this.user.set(null);
          this.router.navigate(['/login']);

          return of(false);
        })
      );
  }

  isRefreshInProgress(): boolean {
    return this.refreshInProgress();
  }
}
