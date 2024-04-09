import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NAME_TAG_TYPE } from '../constants/common';
import { Explorer } from './explorer.entity';

@Entity('private_name_tag')
@Index(['address', 'createdBy'], { unique: true })
export class PrivateNameTag {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  type: NAME_TAG_TYPE;

  @Column({ default: false, name: 'is_favorite' })
  isFavorite: boolean;

  @Column('text', { name: 'name_tag' })
  nameTag: string;

  @Column({ length: 500, default: null, nullable: true })
  note: string;

  @Column()
  address: string;

  @Column({ name: 'evm_address', nullable: true })
  evmAddress: string;

  @Column({ name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Explorer, (explorer) => explorer.privateNameTags)
  @JoinColumn({
    name: 'explorer_id',
  })
  explorer: Explorer;
}
