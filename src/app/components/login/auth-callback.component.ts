import { Component, inject, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
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
  `
})
export class AuthCallbackComponent {

  private router = inject(Router);
  private auth = inject(AuthService);
  readonly loading = signal(true);

  constructor() {
    effect(() => {
      const user = this.auth.user();

      if (!user) return;

      this.loading.set(false);
      this.router.navigate(['/'], { replaceUrl: true });
    });
  }

  ngOnInit() {
    this.auth.loadUser();
  }
}
