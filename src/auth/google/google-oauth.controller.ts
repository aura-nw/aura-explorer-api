import { Body, Controller, HttpStatus, Post, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleOAuthLoginParamsDto } from '../../components/google/dtos/google-oauth-login.params.dto';
import { GoogleOAuthLoginResponseDto } from '../../components/google/dtos/google-oauth-login.response.dto';
import { MESSAGES } from '../../shared';

@ApiTags('auth')
@Controller('auth')
@ApiBadRequestResponse({
  description: MESSAGES.ERROR.BAD_REQUEST,
})
export class GoogleOauthController {
  constructor(private googleOAuthService: GoogleOAuthService) {}

  @Post('google')
  @ApiOperation({ summary: 'Verify google access token' })
  @ApiOkResponse({
    description: 'Return user access tokens.',
    type: GoogleOAuthLoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: GoogleOAuthLoginParamsDto,
  ): Promise<GoogleOAuthLoginResponseDto> {
    const tokens = await this.googleOAuthService.login(request);
    return tokens;
  }
}
