import { Injectable } from '@nestjs/common';

import { AkcLogger, RequestContext } from './shared';
import * as appConfig from './shared/configs/configuration';

@Injectable()
export class AppService {
  cosmosScanAPI: string;
  private appParams;

  constructor(private readonly logger: AkcLogger) {
    this.logger.setContext(AppService.name);
    this.appParams = appConfig.default();
    this.cosmosScanAPI = this.appParams.cosmosScanAPI;
  }
  getHello(): string {
    const ctx = new RequestContext();
    this.logger.log(ctx, 'Hello World!');
    return 'Hello World!';
  }
}
