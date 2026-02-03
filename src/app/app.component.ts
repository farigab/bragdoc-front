import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { switchMap, catchError, of } from 'rxjs';
import { BackendHealthService } from './services/backend-health.service';
import { AuthService } from './services/auth.service';
import { SwUpdateService } from './services/sw-update.service';
import { BackendLoadingComponent } from './components/backend-loading/backend-loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackendLoadingComponent],
  template: `
    @if (showLoading()) {
      <app-backend-loading />
    }

    @if (healthService.status().isAvailable) {
      <router-outlet />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  protected readonly healthService = inject(BackendHealthService);
  private readonly authService = inject(AuthService);
  private readonly swUpdate = inject(SwUpdateService);

  readonly showLoading = computed(() => {
    const status = this.healthService.status();
    return !status.isAvailable && (status.isWarming || status.failedAttempts > 0);
  });

  ngOnInit(): void {
    this.swUpdate.init();

    this.healthService.checkHealth().pipe(
      switchMap(() => {
        if (this.healthService.isHealthy()) {
          return this.authService.checkSession();
        }
        return of(false);
      }),
      catchError((error) => {
        console.error('[App] Initialization error:', error);
        return of(false);
      })
    ).subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          console.log('[App] User authenticated');
        }
      },
      error: (error) => {
        console.error('[App] Critical error during initialization:', error);
      }
    });
  }
}
