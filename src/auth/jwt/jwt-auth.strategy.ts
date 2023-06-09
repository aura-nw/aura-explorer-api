import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../components/user/user.service';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = { sub: number; email: string };

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOneById(payload.sub);

    this.userService.checkRole(user);

    return { id: payload.sub, email: payload.email };
  }
}

const extractJwtFromCookie = (req) => {
  // Get JWT from cookie or Bearer token
  let token = null;

  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }

  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};
