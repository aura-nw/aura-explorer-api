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
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../components/user/user.service';
import { ConfigService } from '@nestjs/config';
import { MSGS_ACTIVE_USER } from '../../shared/constants/common';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { LoginUserWithPassword } from './dtos/login-with-password.dto';
import { PasswordAuthService } from './password-auth.service';
import { LoginUserWithPasswordResponseDto } from './dtos/login-with-password.response.dto';

@ApiTags('auth')
@Controller('auth')
export class PasswordAuthController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private passwordAuthService: PasswordAuthService,
  ) {}

  @Get('/verify-email/email=:email&code=:code')
  async verifyEmail(
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

  @Get('resend-verification-email/:email')
  @HttpCode(HttpStatus.OK)
  async resendConfirmationEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);

    await this.userService.resendVerificationEmail(user);
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

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() request: ResetPasswordDto) {
    await this.userService.resetPassword(request);
  }

  @Post('login-with-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Return user access tokens.',
    type: LoginUserWithPasswordResponseDto,
  })
  async loginWithPassword(
    @Body() request: LoginUserWithPassword,
  ): Promise<LoginUserWithPasswordResponseDto> {
    return await this.passwordAuthService.login(
      request.email,
      request.password,
    );
  }
}
