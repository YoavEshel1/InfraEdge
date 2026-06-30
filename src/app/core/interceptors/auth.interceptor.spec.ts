import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const setup = (token: string | null) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { token: signal(token) } as unknown as AuthService,
        },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => httpMock.verify());

  // Tests: that the interceptor injects a Bearer Authorization header into every outgoing HTTP request when AuthService has a token.
  // Expected: the intercepted request carries an 'Authorization: Bearer tok-alice-a1b2c3' header.
  it('should attach Authorization header when a token is present', () => {
    setup('tok-alice-a1b2c3');
    httpClient.get('/api/tasks').subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-alice-a1b2c3');
    req.flush([]);
  });

  // Tests: that the interceptor leaves the request unmodified when AuthService has no token (unauthenticated state).
  // Expected: the intercepted request does not contain an 'Authorization' header.
  it('should NOT attach Authorization header when token is null', () => {
    setup(null);
    httpClient.get('/api/tasks').subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
