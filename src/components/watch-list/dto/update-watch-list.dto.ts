import { CreateWatchListDto } from './create-watch-list.dto';
import { IsValidBench32Address } from '../validators/validate-address';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { MatchKeys } from '../validators/match-keys';
import { WATCH_LIST } from '../../../shared/constants/common';

export class UpdateWatchListDto extends PartialType(CreateWatchListDto) {
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsValidBench32Address('address')
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MatchKeys(WATCH_LIST.SETTINGS_EXAMPLE)
  settings: JSON;
}
