import { Expose } from 'class-transformer';

export class VerifyCodeStepOutputDto {
  @Expose()
  id: string;

  @Expose()
  code_id: number;

  @Expose()
  check_id: number;

  @Expose()
  check_name: string;

  @Expose()
  result: string;

  @Expose()
  msg_code: string;
}
