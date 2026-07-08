import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../application/authentication.service';

export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/iam/sign-in'], {
        queryParams: { returnUrl: state.url }
      });
};
