import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { MESSAGES, PROVIDER, USER_ROLE } from '../../shared';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserWithPasswordDto } from '../../auth/password/dtos/create-user-with-password.dto';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: UserRepository,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async findOne(params: FindOneOptions<User> = {}): Promise<User> {
    return await this.usersRepository.findOne(params);
  }

  async findOneById(id: number): Promise<User> {
    return await this.usersRepository.findOne({ id });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${JSON.stringify(user)}`);
    return await this.usersRepository.save(user);
  }

  async update(user: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user: ${JSON.stringify(user)}`);
    const foundUser = await this.findOne({ where: { id: user.id } });

    if (foundUser) {
      await this.usersRepository.merge(foundUser, user);
      return await this.usersRepository.save(foundUser);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async delete(id: number): Promise<void> {
    const foundUser = await this.findOne({ where: { id: id } });

    if (foundUser) {
      await this.usersRepository.delete(id);
    } else {
      throw new NotFoundException('User not found');
    }
  }

  checkRole(user: DeepPartial<User>): void {
    if (!user) {
      throw new UnauthorizedException(MESSAGES.ERROR.NOT_PERMISSION);
    }

    if (user.role === USER_ROLE.BANNED) {
      throw new UnauthorizedException(MESSAGES.ERROR.BANNED);
    }
  }

  async createUserWithPassword(
    userParams: CreateUserWithPasswordDto,
  ): Promise<void> {
    const newUser = new User();
    newUser.encryptedPassword = await bcrypt.hash(
      userParams.password,
      Number(this.configService.get('bcryptSalt')),
    );
    newUser.email = userParams.email;
    newUser.userName = userParams.userName;
    newUser.email = userParams.email;
    newUser.provider = PROVIDER.PASSWORD;
    newUser.role = USER_ROLE.USER;
    newUser.confirmationToken = await this.generateConfirmationToken();

    try {
      await this.usersRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(newUser);
          await this.mailService.sendMailConfirmation(
            newUser,
            newUser.confirmationToken,
          );
          await transactionalEntityManager.save(newUser);
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async activeUser(email: string, token: string): Promise<any> {
    const userToActive = await this.findOne({
      where: { email: email, confirmationToken: token },
    });

    if (!userToActive) {
      throw new NotFoundException('User not found');
    }

    if (userToActive.confirmedAt) {
      throw new BadRequestException('User already active');
    }

    if (userToActive.confirmationToken === token) {
      userToActive.confirmedAt = new Date();
      await this.usersRepository.save(userToActive);
    }
  }

  async generateConfirmationToken(): Promise<string> {
    return randomBytes(20).toString('hex').slice(0, 20).toUpperCase();
  }
}
