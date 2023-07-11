import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleOAuthLoginParamsDto {
  @ApiProperty({ default: '' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiPropertyOptional({
    description: `Optional login to admin site or main site`,
    type: String,
    default: '',
  })
  site: string;
}
