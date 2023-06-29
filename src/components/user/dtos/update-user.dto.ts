import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
