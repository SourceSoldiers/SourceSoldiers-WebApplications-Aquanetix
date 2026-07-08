import { Routes } from '@angular/router';

export const iamRoutes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./presentation/sign-in/sign-in.component').then(m => m.SignInComponent),
    title: 'Aquanetix - Sign In'
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./presentation/sign-up/sign-up.component').then(m => m.SignUpComponent),
    title: 'Aquanetix - Sign Up'
  },
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  }
];
