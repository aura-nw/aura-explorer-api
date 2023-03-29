import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/components/user/user.service';
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
    const user = await this.userService.findOne({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('You have not permission!');
    }

    return { id: payload.sub, email: payload.email };
  }
}

const extractJwtFromCookie = (req) => {
  let token = null;

  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }

  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};
