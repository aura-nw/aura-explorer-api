import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from '../../shared/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { PROVIDER } from '../../shared';
import { join } from 'path';

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
    const apiPrefix = this.configService.get('apiPrefix');
    const appDomain = this.configService.get('appDomain');
    const emailParam = encodeURIComponent(user.email);
    const verifyEmailPath = `/${apiPrefix}/auth/verify-email/email=${emailParam}&code=${token}`;
    const verifyEmailUrl = appDomain + verifyEmailPath;
    const logoPath = join(__dirname, 'images', 'aura-logo.jpg');

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify your email with Aurascan.',
        template: './verification',
        context: { url: verifyEmailUrl },
        attachments: [
          {
            filename: 'image.jpg',
            path: logoPath,
            cid: 'logo',
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Error sending email ${error.message} ${error.stack}`);
      throw error;
    }
  }

  async sendMailResetPassword(user: User, token: string) {
    const auraScanUrl = this.configService.get('auraScanUrl');
    const emailParam = encodeURIComponent(user.email);
    const resetPasswordPath = `/user/reset-password/email=${emailParam}&code=${token}`;
    const resetPasswordUrl = auraScanUrl + resetPasswordPath;
    const logoPath = join(__dirname, 'images', 'aura-logo.jpg');

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Aurascan account recovery.',
        template: './recovery-password',
        context: { url: resetPasswordUrl },
        attachments: [
          {
            filename: 'image.jpg',
            path: logoPath,
            cid: 'logo',
          },
        ],
      });
    } catch (error) {
      this.logger.error(`Error sending email ${error.message} ${error.stack}`);
      throw error;
    }
  }
}
