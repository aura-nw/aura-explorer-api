import { BlockSyncError } from '../../../shared/entities/block-sync-error.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BlockSyncError)
export class BlockSyncErrorRepository extends Repository<BlockSyncError> {}
