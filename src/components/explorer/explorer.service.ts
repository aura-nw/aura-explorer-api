import { UserAuthority } from 'src/shared/entities/user-authority.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExplorerDto } from './dto/create-explorer.dto';
import { UpdateExplorerDto } from './dto/update-explorer.dto';
import { ExplorerParamsDto } from './dto/explorer-params.dto';
import { ExplorerRepository } from './repositories/explorer.repository';
import { RequestContext } from 'src/shared';
import { UserAuthorityService } from '../user-authority/user-authority.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ExplorerService {
  constructor(
    private explorerRepository: ExplorerRepository,
    private userService: UserService,
    private userAuthorityService: UserAuthorityService,
  ) {}
  create(createExplorerDto: CreateExplorerDto) {
    return 'This action adds a new explorer';
  }

  async getExplorers(ctx: RequestContext, param: ExplorerParamsDto) {
    const user = await this.userService.findOneById(ctx.user.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userAuthorities =
      await this.userAuthorityService.findAuthoritiesByEmail(user.email);

    const { result, count } = await this.explorerRepository.getExplorers(
      param.keyword,
      param.limit,
      param.offset,
      userAuthorities.map((item) => item.explorerId),
    );

    return { result, count };
  }

  findOne(id: number) {
    return `This action returns a #${id} explorer`;
  }

  update(id: number, updateExplorerDto: UpdateExplorerDto) {
    return `This action updates a #${id} explorer`;
  }

  remove(id: number) {
    return `This action removes a #${id} explorer`;
  }
}
