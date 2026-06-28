import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth/auth.service';
import { Credentials } from '../../core/auth/models/credentials.model';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  //states — aliases to service signals (singleton, reset on each handleLogin call)
  readonly isLoading = this.authService.loginIsLoading;
  readonly errorMessage = this.authService.loginError;
  readonly passwordVisible = signal(false);


//login form definition 
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });  


  //reveal password toggle
  togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }

  //change password type accrding to toggle button
  get passwordType(): string {
    return this.passwordVisible() ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authService.handleLogin(this.form.value as Credentials);
  }
}
