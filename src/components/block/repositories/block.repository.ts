import { EntityRepository, Repository } from 'typeorm';

import { Block } from '../../../shared';

@EntityRepository(Block)
export class BlockRepository extends Repository<Block> {
    public getMinHeight = async (operator_address: string) => {
        const result = await this.createQueryBuilder()
            .select("height")
            .where({ operator_address })
            .limit(1)
            .addOrderBy("height")
            .getRawOne();

        return result;
    }
}
