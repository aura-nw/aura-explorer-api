import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleOauthModule } from './google/google-oauth.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { UserModule } from 'src/components/user/user.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserModule, PassportModule, GoogleOauthModule, JwtAuthModule],
  controllers: [AuthController],
})
export class AuthModule {}
