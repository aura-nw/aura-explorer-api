import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ValidatorInfoOutput {
  @Expose()
  @ApiProperty()
  operator_address: string;

  @Expose()
  @ApiProperty()
  image_url: string;
}
