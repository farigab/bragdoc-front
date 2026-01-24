import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/github-import/github-import.component')
        .then(m => m.GithubImportComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/reports/reports.component')
        .then(m => m.ReportsComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'auth-callback',
    loadComponent: () =>
      import('./components/login/auth-callback.component')
        .then(m => m.AuthCallbackComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
