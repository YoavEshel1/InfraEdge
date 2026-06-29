import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from './models/user.model';
import { Credentials } from './models/credentials.model';

const STORAGE_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(this.loadFromStorage());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly token = computed(() => this.currentUser()?.token ?? null);

  readonly loginIsLoading = signal(false);
  readonly loginError = signal<string | null>(null);

  //sets the loading state and error state and routes to dashboard on success
  handleLogin(credentials: Credentials): void {
    this.loginIsLoading.set(true);
    this.loginError.set(null);
    this.login(credentials).subscribe({
      next: () => {
        this.loginIsLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.loginIsLoading.set(false);
        this.loginError.set(err.message ?? 'שגיאה בהתחברות');
      },
    });
  }

  //gets the user credentials from the server
  private login(credentials: Credentials): Observable<User> {
    const { email, password } = credentials;
    return this.http
      .get<User[]>(`${environment.apiUrl}/users?email=${encodeURIComponent(email)}`)
      .pipe(
        map((users) => {
          const user = users.find((u) => u.email === email && u.password === password);
          if (!user) throw new Error('אימייל או סיסמה שגויים');
          return user;
        }),
        tap((user) => {
          this.currentUser.set(user);
          //not secured -cannot be used in production - just for demo purposesS
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }),
      );
  }

  //clears the current user and removes it from local storage
  logout(): void {
    this.currentUser.set(null);
    //not secured -cannot be used in production - just for demo purposes    
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  //loads the user from local storage if available
  private loadFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}
