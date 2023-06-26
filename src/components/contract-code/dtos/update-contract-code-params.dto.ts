import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CONTRACT_TYPE } from '../../../shared';

export class UpdateContractCodeParamsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(CONTRACT_TYPE, { message: 'Type is invalid (CW20/CW721)' })
  type: CONTRACT_TYPE;
}
