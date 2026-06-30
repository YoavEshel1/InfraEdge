import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { User } from './models/user.model';

// Minimal stubs needed by provideRouter — used as redirect targets in tests
@Component({ standalone: true, template: '' })
class LoginStubComponent {}

@Component({ standalone: true, template: '' })
class DashboardStubComponent {}

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
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: LoginStubComponent }, { path: 'dashboard', component: DashboardStubComponent }])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fail the test if any HTTP request was made but not explicitly expected
    httpMock.verify();
    localStorage.clear();
  });

  // Tests: that TestBed can instantiate the service without errors.
  // Expected: the injected AuthService instance is truthy (not null/undefined).
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Tests: the initial state of the service when no session is stored in localStorage.
  // Expected: currentUser is null, isAuthenticated is false, and token is null.
  it('should start unauthenticated when localStorage is empty', () => {
    // All derived auth signals must reflect the default unauthenticated state
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  // Tests: that the service re-hydrates its auth signals from a persisted localStorage entry on construction.
  // Expected: currentUser, isAuthenticated, and token all reflect the stored user without any HTTP call.
  it('should restore session from localStorage on init', () => {
    // Seed localStorage before re-bootstrapping so loadFromStorage() picks it up
    localStorage.setItem('currentUser', JSON.stringify(MOCK_USER));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', component: LoginStubComponent }, { path: 'dashboard', component: DashboardStubComponent }])],
    });
    // Fresh instance reads from localStorage in its constructor — session should be restored
    const fresh = TestBed.inject(AuthService);
    expect(fresh.currentUser()).toEqual(MOCK_USER);
    expect(fresh.isAuthenticated()).toBe(true);
    expect(fresh.token()).toBe(MOCK_USER.token);
  });

  describe('handleLogin()', () => {
    // Tests: the happy-path login flow where the email and password both match a user returned by the API.
    // Expected: loginIsLoading flips to true during the request, then signals are set and localStorage is populated on success.
    it('should set currentUser signal and persist to localStorage on success', () => {
      service.handleLogin({ email: 'alice@example.com', password: 'alice123' });

      // While waiting for the HTTP response, loading should be active
      expect(service.loginIsLoading()).toBe(true);

      // Act: resolve the pending HTTP request with a matching user
      httpMock.expectOne('/api/users?email=alice%40example.com').flush([MOCK_USER]);

      // Assert: signals and localStorage are all updated
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.token()).toBe(MOCK_USER.token);
      expect(service.loginIsLoading()).toBe(false);
      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(MOCK_USER));
    });

    // Tests: login failure when the email exists in the API response but the submitted password is incorrect.
    // Expected: loginError is set to the Hebrew error message, isAuthenticated stays false, and loading stops.
    it('should set loginError when password does not match', () => {
      // Server returns the user but the client-side password comparison fails in the map operator
      service.handleLogin({ email: 'alice@example.com', password: 'wrongpassword' });
      httpMock.expectOne('/api/users?email=alice%40example.com').flush([MOCK_USER]);

      expect(service.loginError()).toBe('אימייל או סיסמה שגויים');
      expect(service.isAuthenticated()).toBe(false);
      expect(service.loginIsLoading()).toBe(false);
    });

    // Tests: login failure when the API returns an empty array (email address not registered).
    // Expected: loginError is set to the Hebrew error message and loading stops; the user remains unauthenticated.
    it('should set loginError when no user matches the email', () => {
      // Server returns an empty array — no account exists for this email
      service.handleLogin({ email: 'unknown@example.com', password: 'pass' });
      httpMock.expectOne('/api/users?email=unknown%40example.com').flush([]);

      expect(service.loginError()).toBe('אימייל או סיסמה שגויים');
      expect(service.loginIsLoading()).toBe(false);
    });
  });

  describe('logout()', () => {
    // Tests: that logout() fully clears an active session from both in-memory signals and persistent storage.
    // Expected: currentUser is null, isAuthenticated is false, token is null, and the localStorage entry is removed.
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
