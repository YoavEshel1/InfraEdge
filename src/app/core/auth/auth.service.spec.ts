import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { User } from './models/user.model';

// Minimal stub needed by provideRouter — used as the '/login' redirect target in logout tests
@Component({ standalone: true, template: '' })
class LoginStubComponent {}

// Shared mock user fixture used across all test cases
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
    // Start each test with a clean localStorage so AuthService initialises unauthenticated
    localStorage.clear();
    TestBed.configureTestingModule({
      // Real HttpClient paired with the in-memory testing controller for request interception
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: LoginStubComponent }])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fail the test if any HTTP request was made but not explicitly expected
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when localStorage is empty', () => {
    // All derived auth signals must reflect the default unauthenticated state
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('should restore session from localStorage on init', () => {
    // Seed localStorage before re-bootstrapping so loadFromStorage() picks it up
    localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: LoginStubComponent }])],
    });
    // Fresh instance reads from localStorage in its constructor — session should be restored
    const fresh = TestBed.inject(AuthService);
    expect(fresh.currentUser()).toEqual(MOCK_USER);
    expect(fresh.isAuthenticated()).toBe(true);
    expect(fresh.token()).toBe(MOCK_USER.token);
  });

  describe('login()', () => {
    it('should set currentUser signal and persist to localStorage on success', () => {
      // Arrange: subscribe to capture the emitted User
      let result: User | undefined;
      service.login({ email: 'alice@example.com', password: 'alice123' }).subscribe((user) => (result = user));

      // Act: resolve the pending HTTP request with a matching user
      httpMock.expectOne('/api/users?email=alice%40example.com').flush([MOCK_USER]);

      // Assert: returned value, signals, and localStorage are all updated
      expect(result).toEqual(MOCK_USER);
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.token()).toBe(MOCK_USER.token);
      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(MOCK_USER));
    });

    it('should throw "אימייל או סיסמה שגויים" when password does not match', () => {
      // Server returns the user but the client-side password comparison fails in the map operator
      let caughtError: Error | undefined;
      service.login({ email: 'alice@example.com', password: 'wrongpassword' }).subscribe({
        error: (err: Error) => (caughtError = err),
      });
      httpMock.expectOne('/api/users?email=alice%40example.com').flush([MOCK_USER]);

      expect(caughtError?.message).toBe('אימייל או סיסמה שגויים');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should throw when no user matches the email', () => {
      // Server returns an empty array — no account exists for this email
      let caughtError: Error | undefined;
      service.login({ email: 'unknown@example.com', password: 'pass' }).subscribe({
        error: (err: Error) => (caughtError = err),
      });
      httpMock.expectOne('/api/users?email=unknown%40example.com').flush([]);

      expect(caughtError?.message).toBe('אימייל או סיסמה שגויים');
    });
  });

  describe('logout()', () => {
    it('should clear currentUser signal and localStorage', () => {
      // Arrange: manually seed an authenticated state
      service.currentUser.set(MOCK_USER);
      localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));

      // Act
      service.logout();

      // Assert: all auth state is wiped from both memory and storage
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.token()).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});
