import { SyncPoint } from '../../../shared/entities/sync-point.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(SyncPoint)
export class SyncPointRepository extends Repository<SyncPoint> {}
