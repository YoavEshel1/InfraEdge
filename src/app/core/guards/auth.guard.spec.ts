import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  const setup = (authenticated: boolean) => {
    const routerMock = { createUrlTree: vi.fn().mockReturnValue('/login') };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: () => authenticated } },
        { provide: Router, useValue: routerMock },
      ],
    });

    return { routerMock };
  };

  // Tests: that the guard allows navigation to proceed when AuthService reports the user as authenticated.
  // Expected: authGuard returns true, granting access to the protected route.
  it('should return true when the user is authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  // Tests: that the guard blocks navigation and redirects to the login page when the user is not authenticated.
  // Expected: authGuard calls Router.createUrlTree(['/login']), producing a redirect UrlTree instead of granting access.
  it('should redirect to /login when the user is not authenticated', () => {
    const { routerMock } = setup(false);
    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
