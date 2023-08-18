import { Column, Entity, Unique } from 'typeorm';

import { BaseEntityIncrementId } from './base/base.entity';

@Entity('cipher_keys')
export class CipherKey extends BaseEntityIncrementId {
  @Unique('cipher_text', ['cipher_text'])
  @Column()
  cipher_text: string;
}