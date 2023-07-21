import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleOauthModule } from './google/google-oauth.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { UserModule } from '../components/user/user.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [UserModule, PassportModule, GoogleOauthModule, JwtAuthModule],
  providers: [ConfigService],
  controllers: [AuthController],
})
export class AuthModule {}
