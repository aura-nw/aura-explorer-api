import { Injectable, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { SendMailModule } from './send-mail/send-mail.module';

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
  ],
})
export class QueuesModule {}
