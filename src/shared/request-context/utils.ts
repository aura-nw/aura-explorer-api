import { JwtService } from '@nestjs/jwt';
import {
  FORWARDED_FOR_TOKEN_HEADER,
  REQUEST_ID_TOKEN_HEADER,
} from '../constants';

import { RequestContext } from './request-context.dto';
import { Request } from 'express';
import * as appConfig from '../../shared/configs/configuration';

const jwtService = new JwtService();

export function createRequestContext(request: any): RequestContext {
  const ctx = new RequestContext();
  ctx.requestId = request.header(REQUEST_ID_TOKEN_HEADER);
  ctx.url = request.url;
  ctx.ip = request.header(FORWARDED_FOR_TOKEN_HEADER)
    ? request.header(FORWARDED_FOR_TOKEN_HEADER)
    : request.ip;

  const token = extractTokenFromHeader(request);
  if (!token) {
    ctx.user = null;
  } else {
    const appParams = appConfig.default();
    const payload = jwtService.verify(token, {
      secret: appParams.jwt.secret,
    });
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    ctx.user = {
      id: payload.sub,
      email: payload.email,
    };
  }
  return ctx;
}

function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}
