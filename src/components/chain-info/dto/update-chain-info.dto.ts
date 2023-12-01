import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateChainInfoDto } from './create-chain-info.dto';

export class UpdateChainInfoDto extends PartialType(CreateChainInfoDto) {
  @ApiProperty()
  id: number;
}
