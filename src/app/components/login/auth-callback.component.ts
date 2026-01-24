import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div
        class="flex items-center justify-center min-h-screen"
        aria-busy="true"
        aria-live="polite"
      >
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
          ></div>
          <p>Finalizando login...</p>
        </div>
      </div>
    }
  `,
})
export class AuthCallbackComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(true);

  constructor() {
    this.handleCallback();
  }

  private async handleCallback(): Promise<void> {
    try {
      const ok = await firstValueFrom(this.auth.checkSession());
      await this.router.navigateByUrl(ok ? '/' : '/login', {
        replaceUrl: true,
      });
    } catch {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } finally {
      this.loading.set(false);
    }
  }
}
