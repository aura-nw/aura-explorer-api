import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginUserDto {
  @ApiProperty({ description: 'User email', example: 'example@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
