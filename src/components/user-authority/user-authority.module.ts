import { Module, forwardRef } from '@nestjs/common';
import { UserAuthorityService } from './user-authority.service';
import { UserAuthorityController } from './user-authority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthority } from '../../shared/entities/user-authority.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthority])],
  controllers: [UserAuthorityController],
  providers: [UserAuthorityService],
  exports: [UserAuthorityService],
})
export class UserAuthorityModule {}
