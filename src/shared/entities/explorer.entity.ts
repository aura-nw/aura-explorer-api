import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { PublicNameTag } from './public-name-tag.entity';
import { TokenMarkets } from './token-markets.entity';
import { PrivateNameTag } from './private-name-tag.entity';
import { SyncPoint } from './sync-point.entity';
import { UserActivity } from './user-activity.entity';
import { Notification } from './notification.entity';
import { WatchList } from './watch-list.entity';

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

  @Column({ name: 'minimal_denom' })
  minimalDenom: string;

  @Column({ name: 'decimal' })
  decimal: number;

  @OneToMany(() => PublicNameTag, (publicNameTag) => publicNameTag.explorer)
  publicNameTags: PublicNameTag[];

  @OneToMany(() => TokenMarkets, (token) => token.explorer)
  tokenMarkets: TokenMarkets[];

  @OneToMany(() => PrivateNameTag, (privateNameTag) => privateNameTag.explorer)
  privateNameTags: PrivateNameTag[];

  @OneToMany(() => WatchList, (watchList) => watchList.explorer)
  watchLists: WatchList[];

  @OneToMany(() => SyncPoint, (syncPoint) => syncPoint.explorer)
  syncPoints: SyncPoint[];

  @OneToMany(() => UserActivity, (userActivity) => userActivity.explorer)
  userActivities: UserActivity[];

  @OneToMany(() => Notification, (userActivity) => userActivity.explorer)
  notifications: Notification[];
}
