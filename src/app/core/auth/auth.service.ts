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

  login(credentials: Credentials): Observable<User> {
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

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private loadFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}
