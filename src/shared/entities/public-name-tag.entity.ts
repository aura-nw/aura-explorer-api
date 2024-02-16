import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntityIncrementId } from './base/base.entity';
import { NAME_TAG_TYPE } from '../constants/common';
import { Explorer } from './explorer.entity';

@Entity('public_name_tag')
@Unique(['address'])
@Index(['name_tag', 'explorer'], { unique: true })
export class PublicNameTag extends BaseEntityIncrementId {
  @Column()
  type: NAME_TAG_TYPE;

  @Column()
  name_tag: string;

  @Column()
  address: string;

  @Column()
  updated_by: number;

  @Column({ nullable: true, name: 'enterprise_url' })
  enterpriseUrl: string;

  @ManyToOne(() => Explorer, (explorer) => explorer.publicNameTags)
  @JoinColumn({
    name: 'explorer_id',
  })
  explorer: Explorer;
}
