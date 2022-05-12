import { Request } from 'express';

import {
  FORWARDED_FOR_TOKEN_HEADER,
  REQUEST_ID_TOKEN_HEADER,
} from '../constants';

import { RequestContext } from './request-context.dto';

export function createRequestContext(request: Request): RequestContext {
  const ctx = new RequestContext();
  ctx.requestId = request.header(REQUEST_ID_TOKEN_HEADER);
  ctx.url = request.url;
  ctx.ip = request.header(FORWARDED_FOR_TOKEN_HEADER)
    ? request.header(FORWARDED_FOR_TOKEN_HEADER)
    : request.ip;

  // ctx.user = request.user
  //   ? plainToClass(UserAccessTokenClaims, request.user, {
  //       excludeExtraneousValues: true,
  //     })
  //   : null;
  ctx.user = null;

  return ctx;
}
