import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../domain/auth-user';

const AUTH_STORAGE_KEY = 'aquanetix.auth';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly currentUserSignal = signal<AuthUser | null>(this.restoreUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUserSignal()?.token));

  constructor(
    private readonly http: HttpClient
  ) {}

  signIn(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${environment.apiUrl}/authentication/sign-in`, { email, password })
      .pipe(tap(user => this.persistUser(user)));
  }

  signUp(email: string, password: string, plan: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${environment.apiUrl}/authentication/sign-up`, { email, password, plan })
      .pipe(tap(user => this.persistUser(user)));
  }

  signOut(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.currentUserSignal.set(null);
    window.location.assign('/iam/sign-in');
  }

  token(): string | null {
    return this.currentUserSignal()?.token ?? null;
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private restoreUser(): AuthUser | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    try {
      const user = JSON.parse(stored) as AuthUser;
      return user?.token ? user : null;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
