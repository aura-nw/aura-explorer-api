import { CreateWatchListDto } from './create-watch-list.dto';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { MatchKeys } from '../validators/match-keys';
import { WATCH_LIST } from '../../../shared/constants/common';
import { Explorer } from 'src/shared/entities/explorer.entity';

export class UpdateWatchListDto extends PartialType(CreateWatchListDto) {
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MatchKeys(WATCH_LIST.SETTINGS_EXAMPLE)
  settings: JSON;

  explorer: Explorer;
}
