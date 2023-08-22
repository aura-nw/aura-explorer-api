import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('cipher_keys')
export class CipherKey extends BaseEntityIncrementId {
  @Column('text')
  cipher_text: string;
}
