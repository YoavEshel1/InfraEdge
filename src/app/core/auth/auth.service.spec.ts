import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { User } from './models/user.model';

@Component({ standalone: true, template: '' })
class LoginStubComponent {}

const MOCK_USER: User = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  password: 'alice123',
  token: 'tok-alice-a1b2c3',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: LoginStubComponent }])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when localStorage is empty', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('should restore session from localStorage on init', () => {
    localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: LoginStubComponent }])],
    });
    const fresh = TestBed.inject(AuthService);
    expect(fresh.currentUser()).toEqual(MOCK_USER);
    expect(fresh.isAuthenticated()).toBe(true);
    expect(fresh.token()).toBe(MOCK_USER.token);
  });

  describe('login()', () => {
    it('should set currentUser signal and persist to localStorage on success', () => {
      let result: User | undefined;
      service.login('alice@example.com', 'alice123').subscribe((user) => (result = user));
      httpMock.expectOne('/api/users?email=alice%40example.com').flush([MOCK_USER]);

      expect(result).toEqual(MOCK_USER);
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.token()).toBe(MOCK_USER.token);
      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(MOCK_USER));
    });

    it('should throw "אימייל או סיסמה שגויים" when password does not match', () => {
      let caughtError: Error | undefined;
      service.login('alice@example.com', 'wrongpassword').subscribe({
        error: (err: Error) => (caughtError = err),
      });
      httpMock.expectOne('/api/users?email=alice%40example.com').flush([MOCK_USER]);

      expect(caughtError?.message).toBe('אימייל או סיסמה שגויים');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should throw when no user matches the email', () => {
      let caughtError: Error | undefined;
      service.login('unknown@example.com', 'pass').subscribe({
        error: (err: Error) => (caughtError = err),
      });
      httpMock.expectOne('/api/users?email=unknown%40example.com').flush([]);

      expect(caughtError?.message).toBe('אימייל או סיסמה שגויים');
    });
  });

  describe('logout()', () => {
    it('should clear currentUser signal and localStorage', () => {
      service.currentUser.set(MOCK_USER);
      localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.token()).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});
