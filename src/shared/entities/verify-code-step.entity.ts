import { Column, Entity, Unique } from 'typeorm';
import { VERIFY_CODE_RESULT } from '../constants/common';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('verify_code_step')
@Unique(['code_id', 'check_id'])
export class VerifyCodeStep extends BaseEntityIncrementId {
  @Column()
  code_id: number;

  @Column({
    type: 'enum',
    enum: VERIFY_CODE_RESULT,
    default: VERIFY_CODE_RESULT.PENDING,
  })
  result: VERIFY_CODE_RESULT;

  @Column()
  check_id: number;

  @Column()
  msg_code: string;
}
