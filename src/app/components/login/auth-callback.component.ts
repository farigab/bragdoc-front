import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    effect(() => {
      this.auth
        .checkSession()
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (ok) => this.redirect(ok),
          error: () => this.redirect(false),
        });
    });
  }

  private redirect(isAuthenticated: boolean): void {
    this.loading.set(false);

    this.router.navigateByUrl(
      isAuthenticated ? '/' : '/login',
      { replaceUrl: true }
    );
  }
}
