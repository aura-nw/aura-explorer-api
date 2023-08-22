import { ApiProperty } from '@nestjs/swagger';

export class GoogleOAuthLoginResponseDto {
  @ApiProperty({ description: 'User access token', example: 'xxx...' })
  accessToken: string;

  @ApiProperty({ description: 'User refresh token', example: 'xxx...' })
  refreshToken: string;

  @ApiProperty({ description: 'User name', example: 'example name' })
  userName: string;

  @ApiProperty({ description: 'User email', example: 'example email' })
  userEmail: string;

  @ApiProperty({ description: 'User provider', example: 'example provider' })
  provider: string;

  @ApiProperty({
    description: 'User picture',
    example: 'https://example.com...',
  })
  picture: string;
}
