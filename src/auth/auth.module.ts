import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleOauthModule } from './google/google-oauth.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { UserModule } from '../components/user/user.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { UserAuthorityModule } from 'src/components/user-authority/user-authority.module';
import { UserAuthorityService } from 'src/components/user-authority/user-authority.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthority } from 'src/shared/entities/user-authority.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { User } from 'src/shared/entities/user.entity';

@Module({
  imports: [
    UserModule,
    PassportModule,
    GoogleOauthModule,
    JwtAuthModule,
    UserAuthorityModule,
    TypeOrmModule.forFeature([User, Explorer, UserAuthority]),
  ],
  providers: [ConfigService, UserAuthorityService],
  controllers: [AuthController],
})
export class AuthModule {}
