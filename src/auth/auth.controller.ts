import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from 'src/components/refresh-token/dtos/create-refresh-token.dto';
import { JwtAuthService } from './jwt/jwt-auth.service';
import { UserService } from 'src/components/user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private jwtAuthService: JwtAuthService,
    private userService: UserService,
  ) {}
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
