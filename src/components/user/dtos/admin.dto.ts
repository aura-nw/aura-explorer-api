import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class AdminDto extends CreateUserDto {
  @ApiPropertyOptional({
    description: 'Created by super admin id',
    default: null,
  })
  createdBy: number;

  @ApiPropertyOptional({})
  chainId: string;
}
