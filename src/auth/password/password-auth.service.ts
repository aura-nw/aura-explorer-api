import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../components/user/user.service';
import { User } from '../../shared/entities/user.entity';
import { compare } from 'bcrypt';
import { JwtAuthService } from '../jwt/jwt-auth.service';
import { LoginUserWithPasswordResponseDto } from './dtos/login-with-password.response.dto';

@Injectable()
export class PasswordAuthService {
  constructor(
    private userService: UserService,
    private jwtAuthService: JwtAuthService,
  ) {}
  async validate(userName: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ where: { userName } });

    if (user) {
      if (!user.confirmedAt) {
        throw new UnauthorizedException('User not confirmed with us before.');
      }
      const isValidPassword = await compare(password, user.encryptedPassword);

      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid username or password.');
      }
    } else {
      throw new UnauthorizedException('Invalid username or password.');
    }

    return user;
  }

  async login(
    userName: string,
    password: string,
  ): Promise<LoginUserWithPasswordResponseDto> {
    const user = await this.validate(userName, password);

    const jwtTokens = await this.jwtAuthService.login(user);
    return { ...jwtTokens, userName };
  }
}
