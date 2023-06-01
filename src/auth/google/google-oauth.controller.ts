import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from './google-oauth.guard';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tokens } from '../jwt/jwt-auth.service';

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
  async googleAuthRedirect(@Req() req): Promise<Tokens> {
    const tokens = await this.jwtAuthService.login(req.user);

    return tokens;
  }
}
