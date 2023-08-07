import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../components/user/user.service';
import { OAuth2Client } from 'google-auth-library';
import { PROVIDER, SITE, USER_ROLE } from '../../shared';
import { User } from '../../shared/entities/user.entity';
import { GoogleOAuthLoginResponseDto } from '../../components/google/dtos/google-oauth-login.response.dto';
import { GoogleOAuthLoginParamsDto } from '../../components/google/dtos/google-oauth-login.params.dto';

@Injectable()
export class GoogleOAuthService {
  private googleOAuthClient: OAuth2Client;
  private readonly googleClientID: string;
  private readonly googleSecret: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtAuthService: JwtAuthService,
  ) {
    this.googleClientID = this.configService.get('googleOAuth.clientId');
    this.googleSecret = this.configService.get('googleOAuth.clientSecret');
    this.googleOAuthClient = new OAuth2Client(
      this.googleClientID,
      this.googleSecret,
    );
  }

  async authenticate(
    request: GoogleOAuthLoginParamsDto,
  ): Promise<{ user: User; picture: string }> {
    try {
      const tokenVerified = await this.googleOAuthClient.verifyIdToken({
        idToken: request.token,
        audience: this.googleClientID,
      });
      const { email: googleEmail, name, picture } = tokenVerified.getPayload();
      const adminInitEmail = this.configService.get('adminInitEmail');

      let user = await this.userService.findOne({
        where: { email: googleEmail },
      });

      const role =
        adminInitEmail === googleEmail ? USER_ROLE.ADMIN : USER_ROLE.USER;

      // login at main site when user not exist: create new user.
      // login at admin site only create init admin setting at env.
      if (
        (!user && request.site === SITE.MAIN) ||
        (!user && role === USER_ROLE.ADMIN)
      ) {
        user = await this.userService.create({
          email: googleEmail,
          provider: PROVIDER.GOOGLE,
          name: name,
          role: role,
          verifiedAt: new Date(),
        });
      }

      if (!user.verifiedAt) {
        user.verifiedAt = new Date();
        await this.userService.save(user);
      }

      if (request.site !== SITE.MAIN) {
        this.userService.checkRole(user, SITE.ADMIN);
      }
      return { user, picture };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(
    request: GoogleOAuthLoginParamsDto,
  ): Promise<GoogleOAuthLoginResponseDto> {
    const userInfo = await this.authenticate(request);
    const {
      user: { name: userName, email: userEmail, provider: provider },
      picture,
    } = userInfo;
    const jwtTokens = await this.jwtAuthService.login(userInfo.user);
    return { ...jwtTokens, userName, picture, userEmail, provider };
  }
}
