import { Injectable } from '@nestjs/common';

import { AkcLogger, RequestContext } from './shared';

@Injectable()
export class AppService {
  constructor(private readonly logger: AkcLogger) {
    this.logger.setContext(AppService.name);
  }
  getHello(): string {
    const ctx = new RequestContext();
    this.logger.log(ctx, 'Hello World!');
    return 'Hello World!';
  }
}
