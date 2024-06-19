import { Injectable } from '@nestjs/common';
import { CreateUserAuthorityDto } from './dto/create-user-authority.dto';
import { UpdateUserAuthorityDto } from './dto/update-user-authority.dto';
import { Repository } from 'typeorm';
import { UserAuthority } from '../../shared/entities/user-authority.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Injectable()
export class UserAuthorityService {
  constructor(
    private readonly explorerRepository: Repository<Explorer>,
    @InjectRepository(UserAuthority)
    private readonly userAuthorityRepository: Repository<UserAuthority>,
  ) {}
  async create(createUserAuthorityDto: CreateUserAuthorityDto) {
    await this.userAuthorityRepository.save(createUserAuthorityDto);
  }

  async findAll() {
    return await this.userAuthorityRepository.find();
  }

  async findOne(id: number) {
    return await this.userAuthorityRepository.findOne({ id });
  }

  async update(id: number, _updateUserAuthorityDto: UpdateUserAuthorityDto) {
    await this.userAuthorityRepository.update(id, _updateUserAuthorityDto);
  }

  async remove(id: number) {
    await this.userAuthorityRepository.delete(id);
  }

  async checkUserAuthority(userId: number, chainId: string): Promise<boolean> {
    const allAuthorities = await this.userAuthorityRepository.find({
      where: { userId },
    });

    if (allAuthorities.length === 0) {
      return true;
    }

    const explorer = await this.explorerRepository.findOne({
      where: { chainId },
    });

    const authoritiesWithExplorer = await this.userAuthorityRepository.find({
      where: { userId, explorerId: explorer.id },
    });

    return authoritiesWithExplorer.length > 0;
  }
}
