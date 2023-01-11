import { Column, Entity, Index, Unique } from 'typeorm';
import { SOULBOUND_TOKEN_STATUS } from '../constants';
import { BaseEntityIncrementId } from './base/base.entity';

@Entity('soulbound_token')
@Unique(['contract_address', 'token_id'])
export class SoulboundToken extends BaseEntityIncrementId {
  @Column()
  @Index({ unique: false })
  contract_address: string;

  @Column()
  @Index({ unique: false })
  token_id: string;

  @Column()
  token_uri: string;

  @Column({
    nullable: true,
  })
  token_img: string;

  @Column({
    nullable: true,
  })
  img_type: string;

  @Column({
    nullable: true,
  })
  token_name: string;

  @Column({
    nullable: true,
  })
  animation_url: string;

  @Column()
  @Index({ unique: false })
  receiver_address: string;

  @Column({
    type: 'enum',
    enum: SOULBOUND_TOKEN_STATUS,
    default: SOULBOUND_TOKEN_STATUS.UNCLAIM,
  })
  status: SOULBOUND_TOKEN_STATUS;

  @Column({ type: 'text' })
  signature: string;

  @Column({ type: 'text' })
  pub_key: string;

  @Column({ default: false })
  picked: boolean;
}
