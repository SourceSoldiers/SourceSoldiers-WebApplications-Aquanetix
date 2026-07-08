import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../../application/authentication.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, TranslateModule
  ],
  template: `
    <section class="auth-shell">
      <div class="auth-brand">
        <img src="assets/Aquanetix_Logo.png" alt="Aquanetix"><span>Aquanetix</span>
      </div>
      <mat-card class="auth-card">
        <mat-card-content>
          <h1>{{ 'auth.signUpTitle' | translate }}</h1>
          <p class="subtitle">{{ 'auth.signUpSubtitle' | translate }}</p>
          <form (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'auth.email' | translate }}</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" required autocomplete="email">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'auth.password' | translate }}</mat-label>
              <input matInput type="password" name="password" [(ngModel)]="password"
                     required minlength="8" autocomplete="new-password">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'auth.plan' | translate }}</mat-label>
              <mat-select name="plan" [(ngModel)]="plan">
                <mat-option value="Basic">Basic</mat-option>
                <mat-option value="Smart City">Smart City</mat-option>
                <mat-option value="Industrial">Industrial</mat-option>
              </mat-select>
            </mat-form-field>
            <div *ngIf="errorMessage" class="auth-error"><mat-icon>error</mat-icon>{{ errorMessage | translate }}</div>
            <button mat-flat-button color="primary" class="submit-button" type="submit"
                    [disabled]="loading || !email || password.length < 8">
              {{ (loading ? 'auth.creatingAccount' : 'auth.createAccount') | translate }}
            </button>
          </form>
          <p class="auth-link">
            {{ 'auth.haveAccount' | translate }}
            <a routerLink="/iam/sign-in">{{ 'auth.signIn' | translate }}</a>
          </p>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [`
    .auth-shell { min-height: calc(100vh - 156px); display: grid; place-content: center; gap: 18px; padding: 32px 16px; }
    .auth-brand { display: flex; justify-content: center; align-items: center; gap: 10px; color: #064e3b; font: 800 1.5rem Manrope, sans-serif; }
    .auth-brand img { width: 44px; height: 44px; object-fit: contain; }
    .auth-card { width: min(420px, calc(100vw - 32px)); }
    h1 { font-size: 1.8rem; margin-bottom: 6px; }
    .subtitle { color: var(--muted); margin-bottom: 24px; }
    form, mat-form-field { width: 100%; }
    mat-form-field { display: block; }
    .submit-button { width: 100%; height: 46px; }
    .auth-error { display: flex; align-items: center; gap: 8px; color: #b91c1c; background: #fef2f2; padding: 10px 12px; border-radius: 6px; margin-bottom: 10px; }
    .auth-link { text-align: center; color: var(--muted); margin-top: 20px; }
    .auth-link a { color: #047857; font-weight: 700; }
  `]
})
export class SignUpComponent {
  email = '';
  password = '';
  plan = 'Basic';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly auth: AuthenticationService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (!this.email || this.password.length < 8 || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.signUp(this.email.trim(), this.password, this.plan)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: () => this.errorMessage = 'auth.signUpError'
      });
  }
}
