import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(params: FindOneOptions<User> = {}) {
    return await this.usersRepository.findOne(params);
  }

  async create(user: CreateUserDto) {
    return await this.usersRepository.save(user);
  }
}
