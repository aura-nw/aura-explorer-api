import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsUnique } from '../validators/validate-unique';

export class StoreCW20TokenParamsDto {
  @ApiProperty({ default: 0 })
  @IsOptional()
  id: number;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  @IsUnique('contract_address', {
    message: 'The contract_address you entered has already been used.',
  })
  contract_address: string;

  @ApiProperty({ default: '' })
  @IsOptional()
  coin_id: string;

  @ApiProperty({ default: '' })
  @IsOptional()
  image: string;

  @ApiPropertyOptional({ default: null })
  @IsOptional()
  verify_status: string;

  @ApiPropertyOptional({ default: null })
  @IsOptional()
  verify_text: string;
}
