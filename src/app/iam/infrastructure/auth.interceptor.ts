import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from '../application/authentication.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthenticationService).token();

  if (!token || request.url.includes('/authentication/')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};
