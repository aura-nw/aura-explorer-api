import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleOAuthLoginParamsDto {
  @ApiProperty({ default: '' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
