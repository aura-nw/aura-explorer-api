import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  signature: string;

  @IsNotEmpty()
  address: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'User access token', example: 'xxx...' })
  accessToken: string;

  @ApiProperty({ description: 'User refresh token', example: 'xxx...' })
  refreshToken: string;

  @ApiProperty({ description: 'User name', example: 'example name' })
  userName: string;

  @ApiProperty({ description: 'Wallet address', example: '0x...' })
  address: string;
}
