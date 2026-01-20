import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  readonly id: number;
  readonly login: string;
  readonly name: string;
  readonly avatar?: string;
  readonly email?: string;
}

interface JwtPayload {
  id: number;
  login: string;
  name: string;
  avatar?: string;
  email?: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  readonly token = signal<string | null>(null);
  readonly user = signal<AuthUser | null>(null);

  private readonly storageKey = 'bragdoc_token';

  constructor() {
    const saved = this.getCookie(this.storageKey);
    if (saved) {
      this.token.set(saved);
      this.loadUserFromToken(saved);
    }
  }

  loginWithGithub(): void {
    const redirect = `${location.origin}/auth-callback`;
    window.location.href =
      `${environment.apiUrl}/auth/github?redirect=${encodeURIComponent(redirect)}`;
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    this.deleteCookie(this.storageKey);
  }

  setToken(token: string): void {
    if (this.token() === token) return;

    this.token.set(token);
    this.persistToken(token);
    this.loadUserFromToken(token);
  }

  private loadUserFromToken(token: string): void {
    try {
      const payload = jwtDecode<JwtPayload>(token);

      this.user.set({
        id: payload.id,
        login: payload.login,
        name: payload.name,
        avatar: payload.avatar,
        email: payload.email
      });
    } catch (error) {
      console.error('Erro ao decodificar JWT:', error);
      this.logout();
    }
  }

  /* cookies */

  private persistToken(token: string): void {
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    this.setCookie(this.storageKey, token, {
      path: '/',
      sameSite: 'lax',
      expires: exp
    });
  }

  private setCookie(name: string, value: string, opts: any): void {
    let c = `${name}=${value}`;
    if (opts.expires) c += `; Expires=${opts.expires.toUTCString()}`;
    if (opts.path) c += `; Path=${opts.path}`;
    if (opts.sameSite) c += `; SameSite=${opts.sameSite}`;
    document.cookie = c;
  }

  private getCookie(name: string): string | null {
    return document.cookie
      .split('; ')
      .find(c => c.startsWith(name + '='))
      ?.split('=')
      .slice(1)
      .join('=') ?? null;
  }

  private deleteCookie(name: string): void {
    this.setCookie(name, '', { path: '/', expires: new Date(0) });
  }
}
