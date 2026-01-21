import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
      .subscribe(user => this.user.set(user));
  }
}
