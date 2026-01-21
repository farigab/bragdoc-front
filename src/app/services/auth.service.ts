import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { tap, map, catchError, of } from 'rxjs';

export interface AuthUser {
  readonly id: number;
  readonly login: string;
  readonly name: string;
  readonly avatar?: string;
  readonly email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  readonly user = signal<AuthUser | null>(null);

  private http = inject(HttpClient);

  loginWithGithub(): void {
    const redirect = `${location.origin}/auth-callback`;
    window.location.href = `${environment.apiUrl}/auth/github?redirect=${encodeURIComponent(redirect)}`;
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {})
      .subscribe(() => this.user.set(null));
  }

  loadUser(): void {
    this.http.get<AuthUser>(`${environment.apiUrl}/user`)
      .subscribe(user => {
        this.user.set(user);
      });
  }

  checkSession() {
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

}
