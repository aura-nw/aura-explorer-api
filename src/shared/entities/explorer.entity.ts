import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PublicNameTag } from './public-name-tag.entity';
import { TokenMarkets } from './token-markets.entity';
import { PrivateNameTag } from './private-name-tag.entity';

@Entity('explorer')
export class Explorer extends BaseEntityIncrementId {
  @Column({ name: 'chain_id' })
  chainId: string;

  @Column()
  name: string;

  @Column({ name: 'address_prefix' })
  addressPrefix: string;

  @Column({ name: 'chain_db' })
  chainDb: string;

  @OneToMany(() => PublicNameTag, (publicNameTag) => publicNameTag.explorer)
  publicNameTags: PublicNameTag[];

  @OneToMany(() => TokenMarkets, (token) => token.explorer)
  tokenMarkets: TokenMarkets[];

  @OneToMany(() => PrivateNameTag, (privateNameTag) => privateNameTag.explorer)
  privateNameTags: PrivateNameTag[];
}
