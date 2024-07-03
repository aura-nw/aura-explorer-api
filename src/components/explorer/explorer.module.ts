import { Module } from '@nestjs/common';
import { ExplorerService } from './explorer.service';
import { ExplorerController } from './explorer.controller';
import { ExplorerRepository } from './repositories/explorer.repository';
import { UserModule } from '../user/user.module';
import { UserAuthorityModule } from '../user-authority/user-authority.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Explorer } from 'src/shared/entities/explorer.entity';
import { UserAuthority } from 'src/shared/entities/user-authority.entity';
import { UserAuthorityService } from '../user-authority/user-authority.service';
import { User } from 'src/shared/entities/user.entity';

@Module({
  imports: [
    UserModule,
    UserAuthorityModule,
    TypeOrmModule.forFeature([
      User,
      Explorer,
      UserAuthority,
      ExplorerRepository,
    ]),
  ],
  controllers: [ExplorerController],
  providers: [ExplorerService, UserAuthorityService],
})
export class ExplorerModule {}
