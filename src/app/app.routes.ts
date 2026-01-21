import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/github-import',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'achievements',
    loadComponent: () => import('./components/achievement-list/achievement-list.component').then(m => m.AchievementListComponent)
  },
  {
    path: 'achievements/new',
    loadComponent: () => import('./components/achievement-form/achievement-form.component').then(m => m.AchievementFormComponent)
  },
  {
    path: 'achievements/edit/:id',
    loadComponent: () => import('./components/achievement-form/achievement-form.component').then(m => m.AchievementFormComponent)
  },
  {
    path: 'timeline',
    loadComponent: () => import('./components/timeline/timeline.component').then(m => m.TimelineComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'github-import',
    loadComponent: () => import('./components/github-import/github-import.component').then(m => m.GithubImportComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth-callback',
    loadComponent: () => import('./components/login/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
