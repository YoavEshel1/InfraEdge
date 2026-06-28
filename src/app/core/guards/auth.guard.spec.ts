import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

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

  it('should return true when the user is authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /login when the user is not authenticated', () => {
    const { routerMock } = setup(false);
    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
