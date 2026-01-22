import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const clonedReq = req.clone({ withCredentials: true });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.code === 'TOKEN_EXPIRED') {
        if (authService.isRefreshInProgress()) {
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          switchMap((success: boolean) => {
            if (success) {
              const retryReq = req.clone({ withCredentials: true });
              return next(retryReq);
            }
            return throwError(() => error);
          }),
          catchError((refreshError: unknown) => {
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
