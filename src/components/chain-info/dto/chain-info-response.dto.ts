import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateChainInfoDto } from './update-chain-info.dto';

export class ChainInfoResponseDto extends PartialType(UpdateChainInfoDto) {
  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
