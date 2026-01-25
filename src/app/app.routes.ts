// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/github-import/github-import.component')
            .then(m => m.GithubImportComponent)
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
    redirectTo: ''
  }
];
