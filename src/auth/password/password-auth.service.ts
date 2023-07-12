import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../components/user/user.service';
import { User } from '../../shared/entities/user.entity';
import { compare } from 'bcrypt';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { LoginUserWithPasswordResponseDto } from './dtos/login-with-password.response.dto';
import { IsNull, Not } from 'typeorm';
import { MSGS_USER } from '../../shared';

@Injectable()
export class PasswordAuthService {
  constructor(
    private userService: UserService,
    private jwtAuthService: JwtAuthService,
  ) {}
  async validate(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne({
      where: { email: email, encryptedPassword: Not(IsNull()) },
    });

    if (!user) {
      throw new UnauthorizedException(MSGS_USER.EU002);
    }

    if (!user.verifiedAt) {
      throw new UnauthorizedException(MSGS_USER.EU001);
    }

    const isValidPassword = await compare(password, user.encryptedPassword);

    if (!isValidPassword) {
      throw new UnauthorizedException(MSGS_USER.EU002);
    }

    return user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<LoginUserWithPasswordResponseDto> {
    const user = await this.validate(email, password);

    const jwtTokens = await this.jwtAuthService.login(user);
    return { ...jwtTokens, email };
  }
}
