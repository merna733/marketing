import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { LoadingService } from '../services/loading';
import { finalize } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject<AuthService>(AuthService);
  const loadingService = inject<LoadingService>(LoadingService);

  loadingService.setLoading(true);

  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(finalize(() => loadingService.setLoading(false)));
};
