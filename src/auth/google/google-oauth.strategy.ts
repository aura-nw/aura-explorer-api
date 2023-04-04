import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/components/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
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
    const googleProvider = 'google';

    let user = await this.userService.findOne({
      where: { provider: googleProvider, email: googleEmail },
    });

    if (adminInitEmail === googleEmail && !user) {
      user = await this.userService.create({
        email: googleEmail,
        provider: googleProvider,
        username: name.givenName,
      });
    }

    if (!user) {
      throw new UnauthorizedException('You have not permission!');
    }

    return user;
  }
}
