import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
// If the user is authenticated, allow access; otherwise, redirect to the login page
  return authService.isAuthenticated() || router.createUrlTree(['/login']);
};
