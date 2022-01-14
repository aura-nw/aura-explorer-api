import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { configModuleOptions } from './configs/module-options';
import { AllExceptionsFilter } from './filters/all-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AkcLoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number | undefined>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.pass'),
        entities: [join(__dirname, `./entities/**`, '*.entity.{ts,js}')],
        synchronize: false,
        migrations: [join(__dirname, '../migrations/**', '*{.ts,.js}')],
        migrationsRun: true,
      }),
    }),
    AkcLoggerModule,
  ],
  exports: [ConfigModule, AkcLoggerModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class SharedModule {}
