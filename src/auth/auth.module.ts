import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleOauthModule } from './google/google-oauth.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { UserModule } from '../components/user/user.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { UserAuthorityModule } from '../components/user-authority/user-authority.module';
import { UserAuthorityService } from 'src/components/user-authority/user-authority.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    GoogleOauthModule,
    JwtAuthModule,
    UserAuthorityModule,
  ],
  providers: [ConfigService, UserAuthorityService],
  controllers: [AuthController],
})
export class AuthModule {}
