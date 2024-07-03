import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddUserAuthorityDto } from './dto/create-user-authority.dto';
import { UpdateUserAuthorityDto } from './dto/update-user-authority.dto';
import { Repository } from 'typeorm';
import { UserAuthority } from '../../shared/entities/user-authority.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { User } from 'src/shared/entities/user.entity';
import { USER_ROLE } from 'src/shared';

@Injectable()
export class UserAuthorityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Explorer)
    private readonly explorerRepository: Repository<Explorer>,
    @InjectRepository(UserAuthority)
    private readonly userAuthorityRepository: Repository<UserAuthority>,
  ) {}
  async create(createUserAuthorityDto: AddUserAuthorityDto) {
    try {
      const explorer = await this.explorerRepository.findOne({
        where: { chainId: createUserAuthorityDto.chainId },
      });
      if (!explorer) {
        throw new NotFoundException('Explorer not found');
      }

      const user = await this.userRepository.findOne({
        where: { email: createUserAuthorityDto.email },
      });

      if (!user) {
        this.userRepository.save({
          email: createUserAuthorityDto.email,
          role: USER_ROLE.ADMIN,
        });
      } else {
        this.userRepository.update(user.id, {
          role: USER_ROLE.ADMIN,
        });
      }

      createUserAuthorityDto.explorerId = explorer.id;
      const userAuthority = await this.userAuthorityRepository.find({
        explorerId: createUserAuthorityDto.explorerId,
        email: createUserAuthorityDto.email,
      });

      if (userAuthority.length > 0) {
        throw new BadRequestException('User authority already exists');
      }

      return await this.userAuthorityRepository.save(createUserAuthorityDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return await this.userAuthorityRepository.find();
  }

  async findAuthoritiesByUserId(userId: number) {
    return await this.userAuthorityRepository.find({
      where: { userId },
    });
  }

  async findAuthoritiesByEmail(email: string) {
    return await this.userAuthorityRepository.find({
      where: { email },
    });
  }

  async findOne(id: number) {
    return await this.userAuthorityRepository.findOne({ id });
  }

  async update(id: number, updateUserAuthorityDto: UpdateUserAuthorityDto) {
    const explorer = await this.explorerRepository.findOne({
      where: { chainId: updateUserAuthorityDto.chainId },
    });
    if (!explorer) {
      throw new NotFoundException('Explorer not found');
    }
    updateUserAuthorityDto.explorerId = explorer.id;
    await this.userAuthorityRepository.update(id, updateUserAuthorityDto);
  }

  async remove(id: number) {
    await this.userAuthorityRepository.delete(id);
  }

  async checkUserAuthority(email: string, chainId: string): Promise<boolean> {
    const allAuthorities = await this.userAuthorityRepository.find({
      where: { email },
    });

    if (allAuthorities.length === 0) {
      return true;
    }

    const explorer = await this.explorerRepository.findOne({
      where: { chainId },
    });

    const authoritiesWithExplorer = await this.userAuthorityRepository.find({
      where: { email, explorerId: explorer.id },
    });

    return authoritiesWithExplorer.length > 0;
  }
}
