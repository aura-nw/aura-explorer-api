import {
  CacheInterceptor,
  CacheModule,
  CacheModuleOptions,
  Module,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as redisStore from 'cache-manager-redis-store';

import { configModuleOptions } from './configs/module-options';
import { AllExceptionsFilter } from './filters/all-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AkcLoggerModule } from './logger/logger.module';
import { RedisUtil } from './utils/redis.util';
import { EncryptionModule } from '../components/encryption/encryption.module';
import { CipherKey } from './entities/cipher-key.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CipherKey]),
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
        logging: configService.get<boolean>('database.logging'),
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const cacheConfig: CacheModuleOptions = {
          ttl: Number(configService.get<number | 1000>('cacheManagement.ttl')),
        };
        const useRedis =
          Number(configService.get<number>('cacheManagement.useRedis')) || 0;
        if (Number(useRedis) > 0) {
          cacheConfig.store = redisStore;
          cacheConfig.host = configService.get<string>('cacheManagement.host');
          cacheConfig.port = Number(
            configService.get<number | 6379>('cacheManagement.port'),
          );
          cacheConfig.db =
            Number(configService.get<number>('cacheManagement.db')) || 0;
        }
        return { ...cacheConfig };
      },
    }),

    AkcLoggerModule,
    EncryptionModule,
  ],
  exports: [ConfigModule, AkcLoggerModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: 'CACHE_INTERCEPTOR', useClass: CacheInterceptor },
    RedisUtil,
  ],
})
export class SharedModule {}
