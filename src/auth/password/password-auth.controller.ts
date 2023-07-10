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
import { MSGS_ACTIVE_USER } from '../../shared/constants/common';

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

    const resultActive = await this.userService.activeUser(email, code);

    if (resultActive.code === MSGS_ACTIVE_USER.SA001.code) {
      res.redirect(`${auraScanUrl}/user/welcome`);
    } else if (resultActive.code === MSGS_ACTIVE_USER.EA001.code) {
      res.redirect(`${auraScanUrl}/user/already-active`);
    } else {
      res.redirect(`${auraScanUrl}/something-wrong`);
    }
  }

  @Get('resend-confirmation-email/:email')
  @HttpCode(HttpStatus.OK)
  async resendConfirmationEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);

    await this.userService.resendConfirmationEmail(user);
  }
}
