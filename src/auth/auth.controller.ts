import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from '../components/refresh-token/dtos/create-refresh-token.dto';
import { JwtAuthService } from './jwt/jwt-auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private jwtAuthService: JwtAuthService) {}
  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: HttpStatus.OK })
  async refreshToken(@Body() request: RefreshTokenDto) {
    try {
      const newToken = await this.jwtAuthService.refreshToken(
        request.refreshToken.toString(),
      );
      return newToken;
    } catch (err) {
      return { error: err.message, status: HttpStatus.UNAUTHORIZED };
    }
  }
}
