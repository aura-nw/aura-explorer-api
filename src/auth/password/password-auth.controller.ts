import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../../components/user/user.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class PasswordAuthController {
  private logger = new Logger(PasswordAuthController.name);

  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Get('/confirm-email/email=:email&code=:code')
  async confirmEmail(
    @Param('email') email: string,
    @Param('code') code: string,
    @Res() res,
  ) {
    const auraScanUrl = this.configService.get('auraScanUrl');

    try {
      await this.userService.activeUser(email, code);

      res.redirect(`${auraScanUrl}/user/welcome`);
    } catch (err) {
      if (err.response.statusCode === HttpStatus.BAD_REQUEST) {
        res.redirect(`${auraScanUrl}/some-thing-wrong`);
      }

      this.logger.error(err.message, err.stack);
    }
  }

  @Get('resend-confirmation-email/:email')
  @HttpCode(HttpStatus.OK)
  async resendConfirmationEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);

    await this.userService.resendConfirmationEmail(user);
  }
}
