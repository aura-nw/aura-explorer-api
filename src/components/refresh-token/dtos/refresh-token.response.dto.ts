import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({ default: '' })
  accessToken: string;

  @ApiProperty({ default: '' })
  refreshToken: string;
}
