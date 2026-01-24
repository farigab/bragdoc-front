import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
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
        <p-progressSpinner
          styleClass="w-12 h-12"
          strokeWidth="3"
        />
        <p class="mt-4">Finalizando login...</p>
      </div>
    }
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
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
