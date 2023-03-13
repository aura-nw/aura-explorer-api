import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeIdParamsDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Contract code id is required' })
  code_id: number;

  @ApiProperty()
  @IsString()
  commit: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  compiler_version: string;

  @ApiProperty()
  @IsString()
  wasm_file: string;
}
