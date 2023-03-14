import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base/base.entity';

@Entity('queue_info')
export class QueueInfo extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  height: number;

  @Column()
  type: string;

  @Column({
    name: 'job_data',
    type: 'text',
  })
  job_data: string;

  @Column()
  status: boolean;

  @Column()
  group: string;
}
