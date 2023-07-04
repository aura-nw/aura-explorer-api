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
      request.userName,
      request.password,
    );
  }
}
