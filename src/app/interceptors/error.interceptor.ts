import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';
import { NotificationService } from '../services/notification.service';

interface ErrorContext extends Record<string, unknown> {
  readonly url: string;
  readonly method: string;
  readonly status: number;
  readonly message: string;
  readonly timestamp: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const logger = inject(LoggingService);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        logger.error('Non-HTTP error in interceptor', { error });
        return throwError(() => error);
      }

      const context: ErrorContext = {
        url: req.url,
        method: req.method,
        status: error.status,
        message: getErrorMessage(error),
        timestamp: new Date().toISOString()
      };

      logger.error('HTTP Error', context);

      handleSpecificErrors(error, router, notify);

      return throwError(() => error);
    })
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return String(error.error.message);
  }

  const statusMessages: Record<number, string> = {
    0: 'Network error - please check your connection',
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Access forbidden',
    404: 'Resource not found',
    409: 'Conflict - resource already exists',
    422: 'Validation error',
    429: 'Too many requests - please try again later',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service temporarily unavailable',
    504: 'Gateway timeout'
  };

  return statusMessages[error.status] ?? `Error ${error.status}: ${error.statusText}`;
}


function handleSpecificErrors(
  error: HttpErrorResponse,
  router: Router,
  notify: NotificationService
): void {
  switch (error.status) {
    case 401:
      if (!router.url.includes('/login')) {
        notify.warn('Session expired', 'Please log in again');
        router.navigate(['/login']);
      }
      break;

    case 403:
      notify.error('Access Denied', 'You do not have permission to access this resource');
      break;

    case 404:
      break;

    case 422:
      const validationMsg = extractValidationMessage(error);
      if (validationMsg) {
        notify.error('Validation Error', validationMsg);
      }
      break;

    case 429:
      notify.warn('Rate Limit', 'Too many requests. Please wait a moment and try again');
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      notify.error('Server Error', 'An error occurred on our end. Please try again later');
      break;

    case 0:
      // Erro de rede
      notify.error('Network Error', 'Please check your internet connection');
      break;

    default:
      // Outros erros: deixa o service tratar especificamente
      break;
  }
}


function extractValidationMessage(error: HttpErrorResponse): string | null {
  // Formato esperado: { errors: { field: ['message1', 'message2'] } }
  if (error.error?.errors && typeof error.error.errors === 'object') {
    const errors = Object.entries(error.error.errors)
      .map(([field, messages]) => {
        const msgs = Array.isArray(messages) ? messages : [messages];
        return `${field}: ${msgs.join(', ')}`;
      })
      .join('; ');

    return errors || null;
  }

  return null;
}
