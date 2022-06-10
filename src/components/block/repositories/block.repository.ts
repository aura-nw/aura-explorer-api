import { EntityRepository, Repository } from 'typeorm';

import { Block } from '../../../shared';

@EntityRepository(Block)
export class BlockRepository extends Repository<Block> {
    public getMinHeight = async (operator_address: string) =>{
        const result = await this.createQueryBuilder()
        .select("MIN(height) AS height")
        .where({operator_address })
        .getRawOne();

        return result;
    }
}
