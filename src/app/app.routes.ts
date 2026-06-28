import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    // Lazy-load the login component  
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    // Lazy-load the dashboard component and protect it with the authGuard
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/board/board.component').then((m) => m.BoardComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/dashboard' },
];
