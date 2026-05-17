import { Routes } from '@angular/router';
import { configGuard, setupGuard } from './guards/config.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/setup',
    pathMatch: 'full'
  },
  {
    path: 'setup',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [setupGuard]
  },
  {
    path: 'upload',
    loadComponent: () => import('./components/upload/upload.component').then(m => m.UploadComponent),
    canActivate: [configGuard]
  },
  {
    path: 'review',
    loadComponent: () => import('./components/review/review.component').then(m => m.ReviewComponent),
    canActivate: [configGuard]
  },
  {
    path: '**',
    redirectTo: '/setup'
  }
];

// Made with Bob