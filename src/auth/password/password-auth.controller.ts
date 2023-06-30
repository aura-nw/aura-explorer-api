import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/components/user/user.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/components/mail/mail.service';

@ApiTags('auth')
@Controller('auth')
export class PasswordAuthController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  @Get('/confirm-email/email=:email&code=:code')
  async confirmEmail(
    @Param('email') email: string,
    @Param('code') code: string,
    @Res() res,
  ) {
    const auraScanUrl = this.configService.get('aurascanUrl');

    try {
      await this.userService.activeUser(email, code);

      res.redirect(`${auraScanUrl}/user/welcome`);
    } catch (err) {
      if (err.response.statusCode === HttpStatus.BAD_REQUEST) {
        res.redirect(`${auraScanUrl}/user/already-registered`);
      }
    }
  }

  @Get('resend-confirmation-email/:email')
  @HttpCode(HttpStatus.OK)
  async resendConfirmationEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('User have not registered.');
    }

    await this.mailService.sendMailConfirmation(user, user?.confirmationToken);
  }
}
