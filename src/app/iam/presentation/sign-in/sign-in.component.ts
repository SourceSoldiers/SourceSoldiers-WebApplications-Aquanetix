import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../../application/authentication.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslateModule
  ],
  template: `
    <section class="auth-shell">
      <div class="auth-brand">
        <img src="assets/Aquanetix_Logo.png" alt="Aquanetix">
        <span>Aquanetix</span>
      </div>

      <mat-card class="auth-card">
        <mat-card-content>
          <h1>{{ 'auth.signInTitle' | translate }}</h1>
          <p class="subtitle">{{ 'auth.signInSubtitle' | translate }}</p>

          <form (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'auth.email' | translate }}</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" required autocomplete="email">
              <mat-icon matPrefix>mail</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'auth.password' | translate }}</mat-label>
              <input matInput [type]="showPassword ? 'text' : 'password'" name="password"
                     [(ngModel)]="password" required autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword"
                      [attr.aria-label]="'auth.togglePassword' | translate">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div *ngIf="errorMessage" class="auth-error">
              <mat-icon>error</mat-icon>
              {{ errorMessage | translate }}
            </div>

            <button mat-flat-button color="primary" class="submit-button" type="submit"
                    [disabled]="loading || !email || !password">
              {{ (loading ? 'auth.signingIn' : 'auth.signIn') | translate }}
            </button>
          </form>

          <p class="auth-link">
            {{ 'auth.noAccount' | translate }}
            <a routerLink="/iam/sign-up">{{ 'auth.createAccount' | translate }}</a>
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
    mat-form-field { display: block; margin-bottom: 4px; }
    .submit-button { width: 100%; height: 46px; margin-top: 8px; }
    .auth-error { display: flex; align-items: center; gap: 8px; color: #b91c1c; background: #fef2f2; padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; }
    .auth-link { text-align: center; color: var(--muted); margin-top: 20px; }
    .auth-link a { color: #047857; font-weight: 700; }
  `]
})
export class SignInComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly auth: AuthenticationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    if (this.auth.isAuthenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    if (!this.email || !this.password || this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.auth.signIn(this.email.trim(), this.password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          void this.router.navigateByUrl(returnUrl);
        },
        error: () => this.errorMessage = 'auth.invalidCredentials'
      });
  }
}
