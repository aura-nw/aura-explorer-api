import { EntityRepository, Repository } from 'typeorm';

import { SyncStatus } from '../../../shared';

@EntityRepository(SyncStatus)
export class SyncStatusRepository extends Repository<SyncStatus> {}
