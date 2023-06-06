import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { MESSAGES, USER_ROLE } from 'src/shared';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: UserRepository,
  ) {}

  async findOne(params: FindOneOptions<User> = {}): Promise<User> {
    return await this.usersRepository.findOne(params);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async create(user: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${JSON.stringify(user)}`);
    return await this.usersRepository.save(user);
  }

  async update(user: UpdateUserDto): Promise<void> {
    this.logger.log(`Updating user: ${JSON.stringify(user)}`);
    const foundUser = await this.findOne({ where: { id: user.id } });

    if (foundUser) {
      await this.usersRepository.merge(foundUser, user);
      await this.usersRepository.save(foundUser);
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
}
