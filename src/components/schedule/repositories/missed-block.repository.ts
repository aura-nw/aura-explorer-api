import { EntityRepository, Repository } from 'typeorm';

import { MissedBlock } from '../../../shared';

@EntityRepository(MissedBlock)
export class MissedBlockRepository extends Repository<MissedBlock> {}
