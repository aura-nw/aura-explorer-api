import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWatchListDto } from './create-watch-list.dto';

export class WatchListDetailResponse extends PartialType(CreateWatchListDto) {
  @ApiProperty()
  id: number;

  @ApiProperty()
  groupTracking: number;
}
