import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../components/user/user.service';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { MESSAGES } from '../../shared/';

@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
@ApiTags('auth')
@Controller('auth')
export class PasswordAuthController {
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
        res.redirect(`${auraScanUrl}/user/already-registered`);
      }
    }
  }

  @Get('resend-confirmation-email/:email')
  @HttpCode(HttpStatus.OK)
  async resendConfirmationEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);

    await this.userService.resendConfirmationEmail(user);
  }

  @Get('send-reset-password-email/:email')
  @HttpCode(HttpStatus.OK)
  async sendResetPasswordEmail(@Param('email') email: string) {
    const user = await this.userService.findOne({
      where: { email: email },
      relations: ['userActivities'],
    });
    await this.userService.sendResetPasswordEmail(user);
  }

  @Post('reset-password/email=:email&code=:code')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('email') email: string,
    @Param('code') code: string,
    @Body() request: ResetPasswordDto,
  ) {
    await this.userService.resetPassword(email, code, request);
  }
}
