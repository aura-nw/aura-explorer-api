import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SendMailProcessor } from './send-mail.processor';
import { QUEUES } from '../../../shared';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: QUEUES.SEND_MAIL.QUEUE_NAME,
    }),
    MailModule,
  ],
  providers: [SendMailProcessor],
  exports: [
    BullModule.registerQueueAsync({
      name: QUEUES.SEND_MAIL.QUEUE_NAME,
    }),
  ],
})
export class SendMailModule {}
