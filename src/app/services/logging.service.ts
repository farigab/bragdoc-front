import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  error(message: unknown, context?: Record<string, unknown>) {
    try {
      // console.error for now; can forward to telemetry backend
      console.error('[App Error]', message, context ?? {});
    } catch (e) {
      // swallow so logging never throws
      console.error('[LoggingService] failed to log', e);
    }
  }

  info(message: unknown, context?: Record<string, unknown>) {
    console.info('[App Info]', message, context ?? {});
  }
}
