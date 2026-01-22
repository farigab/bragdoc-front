import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'github-import',
        pathMatch: 'full'
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./components/reports/reports.component')
            .then(m => m.ReportsComponent)
      },
      {
        path: 'github-import',
        loadComponent: () => import('./components/github-import/github-import.component').then(m => m.GithubImportComponent)
      },
    ]
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
