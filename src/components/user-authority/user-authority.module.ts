import { Module } from '@nestjs/common';
import { UserAuthorityService } from './user-authority.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthority } from '../../shared/entities/user-authority.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Explorer, UserAuthority])],
  controllers: [],
  providers: [UserAuthorityService],
  exports: [UserAuthorityService],
})
export class UserAuthorityModule {}
