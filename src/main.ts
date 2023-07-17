import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Queue from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import * as cookieParser from 'cookie-parser';

import {
  VALIDATION_PIPE_OPTIONS,
  RequestIdMiddleware,
  QUEUES,
  SYNC_SERVICE_QUEUES,
  CURRENT_NETWORK,
} from './shared';

import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
const logger = new Logger('Main');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());

  // settings
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('apiPrefix'));
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.enableCors();

  // Swagger setup
  const network = CURRENT_NETWORK.NAME;
  const options = new DocumentBuilder()
    .setTitle(`${network} Explorer API service`)
    .setDescription('API Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  //bull-board
  const queues = [
    createQueueAdapter(QUEUES.SEND_MAIL.QUEUE_NAME, configService),
    createQueueAdapter(SYNC_SERVICE_QUEUES.SMART_CONTRACT, configService),
  ];

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues,
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: `${network}Scan Board`,
        miscLinks: [{ text: 'API Docs', url: '/doc' }],
      },
    },
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  const port = configService.get<number>('port');
  await app.listen(port);
}

function createQueueAdapter(
  name: string,
  configService: ConfigService,
): BullAdapter {
  logger.log(`Track queue ${name}`);
  return new BullAdapter(
    new Queue(name, {
      redis: configService.get('cacheManagement.redis'),
      prefix: configService.get<string>('indexer.chainId'),
    }),
  );
}

bootstrap();
