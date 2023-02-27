import { Column, Entity } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('verify_item_check')
export class VerifyItemCheck extends BaseEntityIncrementId {
  @Column()
  check_name: string;

  @Column()
  group_stage: number;
}
