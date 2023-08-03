import { ApiProperty } from '@nestjs/swagger';

export class LoginUserWithPasswordResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  email: string;
}
