import { Injectable, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { SendMailModule } from './send-mail/send-mail.module';
import { TokenModule } from './token/token.module';
import { CW4973QueueModule } from './cw4973/cw4973.module';
import { NotificationModule } from './notification/notification.module';

@Injectable()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        redis: config.get('cacheManagement.redis'),
        prefix: config.get('indexer.chainId'),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
            removeOnFail: config.get('keepJobCount'),
            removeOnComplete: { count: config.get('keepJobCount') },
          },
          removeOnFail: config.get('keepJobCount'),
          removeOnComplete: { count: config.get('keepJobCount') },
        },
      }),
      inject: [ConfigService],
    }),
    SendMailModule,
    TokenModule,
    CW4973QueueModule,
    NotificationModule,
  ],
})
export class QueuesModule {}
