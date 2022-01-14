import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

import configuration from './configuration';

export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: '.env',
  load: [configuration],
  validationSchema: Joi.object({
    API_PREFIX: Joi.string().required(),
    PORT: Joi.number().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),
    RPC: Joi.string().required(),
    START_HEIGHT: Joi.number(),
  }),
};
