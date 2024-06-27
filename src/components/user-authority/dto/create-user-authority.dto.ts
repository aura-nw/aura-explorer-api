import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddUserAuthorityDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  chainId: number;

  @ApiPropertyOptional()
  explorerId: number;
}
