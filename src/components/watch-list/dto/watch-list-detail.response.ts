import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWatchListDto } from './create-watch-list.dto';
import { Exclude } from 'class-transformer';
import { User } from 'src/shared/entities/user.entity';
import { Explorer } from 'src/shared/entities/explorer.entity';

export class WatchListDetailResponse extends PartialType(CreateWatchListDto) {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupTracking: number;

  @ApiProperty()
  privateNameTag: string;

  @ApiProperty()
  publicNameTag: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @Exclude()
  user: User;

  @Exclude()
  explorer: Explorer;
}
