import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { AkcLogger } from '../logger/logger.service';
import { createRequestContext } from '../request-context/utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private akcLogger: AkcLogger) {
    this.akcLogger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const ctx = createRequestContext(request);
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - now;
        const resData = { method, statusCode, responseTime };

        this.akcLogger.log(ctx, 'Request completed', { resData });
      }),
    );
  }
}
