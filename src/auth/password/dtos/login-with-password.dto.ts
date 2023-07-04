import { ApiProperty } from '@nestjs/swagger';

export class LoginUserWithPassword {
  @ApiProperty()
  userName: string;

  @ApiProperty()
  password: string;
}
