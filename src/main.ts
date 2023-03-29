import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { VALIDATION_PIPE_OPTIONS, RequestIdMiddleware } from './shared';

import { AppModule } from './app.module';

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

  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();
