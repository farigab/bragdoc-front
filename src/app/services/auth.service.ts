import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, shareReplay } from 'rxjs';
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

  // Cache da requisição - mantido até logout ou erro
  private userRequest$?: Observable<AuthUser>;

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
          this.clearUserState();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.logger.error('Erro no logout', { err });
          this.notify.error('Erro no logout', String((err as any)?.message ?? err));
          this.clearUserState();
          this.router.navigate(['/login']);
        }
      });
  }

  loadUser(): Observable<AuthUser> {
    // Se já existe cache, retorna ele (evita duplicação)
    if (this.userRequest$) {
      return this.userRequest$;
    }

    this.userRequest$ = this.http
      .get<AuthUser>(`${environment.apiUrl}/user`)
      .pipe(
        tap(user => {
          this.user.set(user);
        }),
        catchError(error => {
          console.error('Erro ao carregar usuário:', error.status);
          // Limpa cache apenas em caso de erro
          this.userRequest$ = undefined;
          throw error;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.userRequest$;
  }

  /**
   * Força recarregamento do usuário (limpa cache).
   */
  reloadUser(): Observable<AuthUser> {
    this.userRequest$ = undefined;
    return this.loadUser();
  }

  checkSession(): Observable<boolean> {
    if (!this.user()) {
      return this.loadUser().pipe(
        map(() => {
          return true;
        }),
        catchError(() => {
          this.clearUserState();
          return of(false);
        })
      );
    }

    return of(true);
  }

  /**
   * Limpa o estado do usuário e cache de requisições.
   */
  private clearUserState(): void {
    this.user.set(null);
    this.userRequest$ = undefined;
  }
}
