import { EntityRepository, Repository } from 'typeorm';

import { Block } from '../../../shared';

@EntityRepository(Block)
export class BlockRepository extends Repository<Block> {}
