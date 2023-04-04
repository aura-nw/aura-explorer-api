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

  findOne(params: FindOneOptions<User> = {}) {
    return this.usersRepository.findOne(params);
  }

  create(user: CreateUserDto) {
    return this.usersRepository.save(user);
  }
}
