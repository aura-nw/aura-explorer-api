import { Process, Processor } from '@nestjs/bull';
import { MailService } from '../../mail/mail.service';
import { Job } from 'bull';
import { QUEUES, USER_ACTIVITIES } from '../../../shared';

@Processor(QUEUES.SEND_MAIL.QUEUE_NAME)
export class SendMailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process(QUEUES.SEND_MAIL.JOB)
  async handleSendMail(job: Job) {
    const mailType = job.data.mailType;
    const user = job.data.user;

    if (mailType === USER_ACTIVITIES.SEND_MAIL_VERIFY) {
      await this.mailService.sendMailVerify(user, user.verificationToken);
    } else if (mailType === USER_ACTIVITIES.SEND_MAIL_RESET_PASSWORD) {
      await this.mailService.sendMailResetPassword(
        user,
        user.resetPasswordToken,
      );
    }
  }
}
