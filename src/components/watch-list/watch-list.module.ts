import { Module } from '@nestjs/common';
import { WatchListService } from './watch-list.service';
import { WatchListController } from './controllers/watch-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchList } from '../../shared/entities/watch-list.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([WatchList]), UserModule],
  controllers: [WatchListController],
  providers: [WatchListService],
})
export class WatchListModule {}
