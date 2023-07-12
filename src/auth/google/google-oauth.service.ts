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

  async adminAuthenticate(
    token: string,
  ): Promise<{ user: User; picture: string }> {
    try {
      const tokenVerified = await this.googleOAuthClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientID,
      });
      const { email: googleEmail, name, picture } = tokenVerified.getPayload();
      const adminInitEmail = this.configService.get('adminInitEmail');

      let user = await this.userService.findOne({
        where: { role: USER_ROLE.ADMIN, email: googleEmail },
      });

      // init first admin user by .env
      if (adminInitEmail === googleEmail && !user) {
        user = await this.userService.create({
          email: googleEmail,
          provider: PROVIDER.GOOGLE,
          name: name,
          role: USER_ROLE.ADMIN,
          verifiedAt: null,
        });
      }

      this.userService.checkRole(user);

      return { user, picture };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async mainAuthenticate(
    token: string,
  ): Promise<{ user: User; picture: string }> {
    try {
      const tokenVerified = await this.googleOAuthClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientID,
      });
      const { email, name, picture } = tokenVerified.getPayload();
      let user = await this.userService.findOne({
        where: { email: email },
      });

      // Create new user when user not exist
      if (!user) {
        user = await this.userService.create({
          email: email,
          provider: PROVIDER.GOOGLE,
          name: name,
          role: USER_ROLE.USER,
          verifiedAt: new Date(),
        });
      }

      return { user, picture };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(
    request: GoogleOAuthLoginParamsDto,
  ): Promise<GoogleOAuthLoginResponseDto> {
    let userInfo;
    if (request.site === SITE.MAIN) {
      userInfo = await this.mainAuthenticate(request.token);
    } else {
      userInfo = await this.adminAuthenticate(request.token);
    }
    const {
      user: { name: userName },
      picture,
    } = userInfo;
    const jwtTokens = await this.jwtAuthService.login(userInfo.user);
    return { ...jwtTokens, userName, picture };
  }
}
