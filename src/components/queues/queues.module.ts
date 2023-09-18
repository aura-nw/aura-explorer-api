import { Injectable, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { SendMailModule } from './send-mail/send-mail.module';
import { CW4973QueueModule } from './cw4973/cw4973.module';

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
          },
        },
      }),
      inject: [ConfigService],
    }),
    SendMailModule,
    CW4973QueueModule,
  ],
})
export class QueuesModule {}
