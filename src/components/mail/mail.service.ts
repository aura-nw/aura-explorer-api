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
    const confirmEmailPath = `/${apiPrefix}/auth/confirm-email/email=${emailParam}&code=${token}`;
    const confirmEmailUrl = appDomain + confirmEmailPath;
    const logoPath = join(__dirname, 'images', 'aura-logo.jpg');

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify your email with Aurascan.',
        template: './confirmation',
        context: { url: confirmEmailUrl },
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
