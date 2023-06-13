import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VerifyCodeStepOutputDto {
  @Expose()
  @ApiResponseProperty({ example: '420' })
  code_id: number;

  @Expose()
  @ApiResponseProperty({ example: '1' })
  check_id: number;

  @Expose()
  @ApiResponseProperty({ example: 'Compiler image format' })
  check_name: string;

  @Expose()
  @ApiResponseProperty({ example: 'Success' })
  result: string;

  @Expose()
  @ApiResponseProperty({ example: 'S001' })
  msg_code: string;
}
