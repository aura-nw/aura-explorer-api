import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Queue from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import * as cookieParser from 'cookie-parser';

import { VALIDATION_PIPE_OPTIONS, RequestIdMiddleware } from './shared';

import { AppModule } from './app.module';
import { RedisUtil } from './shared/utils/redis.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // settings
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get<string>('apiPrefix'));
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.enableCors();

  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle('Aura Explorer API service')
    .setDescription('API Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  //bull-board
  const redisOpts = configService.get('cacheManagement.redis');
  const queueNames = await new RedisUtil().getAllBullQueueName();
  const queues = [];
  const serverAdapter = new ExpressAdapter();

  queueNames.forEach((queueName) => {
    queues.push(
      new BullAdapter(
        Queue(
          queueName,
          `redis://${redisOpts.username}:${redisOpts.password}@${redisOpts.host}:${redisOpts.port}/${redisOpts.db}`,
          { prefix: configService.get<string>('indexer.chainId') },
        ),
      ),
    );
  });

  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues,
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: 'AuraScan Board',
        miscLinks: [{ text: 'API Docs', url: '/doc' }],
      },
    },
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();
