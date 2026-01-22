import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import './polyfills';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { CustomAuraPreset } from './aura‑preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    providePrimeNG({
      theme: {
        preset: CustomAuraPreset,
      }
    }),

    MessageService
  ]
};
