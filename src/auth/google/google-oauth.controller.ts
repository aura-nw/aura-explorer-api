import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleOauthGuard } from './google-oauth.guard';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class GoogleOauthController {
  constructor(private jwtAuthService: JwtAuthService) {}

  @Get('google')
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: HttpStatus.OK })
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { accessToken } = await this.jwtAuthService.login(req.user);

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: true,
    });

    res.send({ accessToken });
  }
}
