import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from '../../shared/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { PROVIDER } from 'src/shared';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendMailConfirmation(user: User, token: string) {
    // Check authentic provider.
    if (user?.provider != PROVIDER.PASSWORD) {
      throw new BadRequestException('User have not registered with password.');
    }

    const url = `${this.configService.get(
      'appDomain',
    )}/auth/confirm?token=${token}`;

    await this.sendMail(
      user.email,
      'Welcome to Aura App! Confirm your email.',
      './confirmation',
      { name: user.userName, url: url },
    );
  }

  async sendMail(to: string, subject: string, template: string, context: any) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
    } catch (error) {
      this.logger.error(`Error sending email ${template} ${error.message}`);
      throw error;
    }
  }
}
