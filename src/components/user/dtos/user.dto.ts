import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UserDto extends CreateUserDto {
  @ApiProperty()
  id: number;
}
