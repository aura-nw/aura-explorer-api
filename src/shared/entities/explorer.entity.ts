import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { TokenMarkets } from './token-markets.entity';

@Entity('explorer')
export class Explorer extends BaseEntityIncrementId {
  @Column({ name: 'chain_id' })
  chainId: string;

  @Column()
  name: string;

  @OneToMany(() => TokenMarkets, (token) => token.explorer, {
    cascade: ['remove'],
  })
  tokenMarkets: TokenMarkets[];
}
