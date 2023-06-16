import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, Min } from 'class-validator';
import { CONTRACT_TYPE } from '../../../shared';

export class RegisterContractCodeParamsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Code id is required' })
  @Min(1)
  code_id: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(CONTRACT_TYPE, { message: 'Type is invalid (CW20/CW721)' })
  type: CONTRACT_TYPE;

  @ApiProperty()
  @IsNotEmpty({ message: 'Account address is required' })
  account_address: string;
}
