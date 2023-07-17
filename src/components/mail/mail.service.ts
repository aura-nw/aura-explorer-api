import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from '../../shared/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { CURRENT_NETWORK, PROVIDER } from '../../shared';
import { join } from 'path';
const LOGO = CURRENT_NETWORK.LOGO || 'aura-logo.jpg';
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendMailVerify(user: User, token: string) {
    // Check authentic provider.
    if (user?.provider != PROVIDER.PASSWORD) {
      throw new BadRequestException('User have not registered with password.');
    }
    const apiPrefix = this.configService.get('apiPrefix');
    const appDomain = this.configService.get('appDomain');
    const emailParam = encodeURIComponent(user.email);
    const verifyEmailPath = `/${apiPrefix}/auth/verify-email/email=${emailParam}&code=${token}`;
    const verifyEmailUrl = appDomain + verifyEmailPath;
    const logoPath = join(__dirname, 'images', LOGO);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Verify your email with ${CURRENT_NETWORK.NAME}scan.`,
        template: './verification',
        context: { url: verifyEmailUrl, networkName: CURRENT_NETWORK.NAME },
        attachments: [
          {
            filename: CURRENT_NETWORK.LOGO,
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
    const chainScanUrl = this.configService.get('chainScanUrl');
    const resetPasswordPath = `/user/reset-password/email/${user.email}/code/${token}`;
    const resetPasswordUrl = chainScanUrl + resetPasswordPath;
    const logoPath = join(__dirname, 'images', LOGO);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `${CURRENT_NETWORK.NAME}scan account recovery.`,
        template: './recovery-password',
        context: { url: resetPasswordUrl },
        attachments: [
          {
            filename: CURRENT_NETWORK.LOGO,
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
