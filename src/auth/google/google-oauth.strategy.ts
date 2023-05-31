import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/components/user/user.service';
import { ConfigService } from '@nestjs/config';
import { PROVIDER, MESSAGES, USER_ROLE } from 'src/shared/constants/common';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(
  Strategy,
  PROVIDER.GOOGLE,
) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('googleOAuth.clientId'),
      clientSecret: configService.get<string>('googleOAuth.clientSecret'),
      callbackURL: configService.get<string>('googleOAuth.redirectUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { emails, name } = profile;
    const googleEmail = emails[0].value;
    const adminInitEmail = this.configService.get<string>('adminInitEmail');

    let user = await this.userService.findOne({
      where: { provider: PROVIDER.GOOGLE, email: googleEmail },
    });

    // init first admin user by .env
    if (adminInitEmail === googleEmail && !user) {
      user = await this.userService.create({
        email: googleEmail,
        provider: PROVIDER.GOOGLE,
        username: name.givenName,
        role: USER_ROLE.ADMIN,
      });
    }

    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
    }

    return user;
  }
}
