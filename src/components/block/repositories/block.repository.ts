import { EntityRepository, Repository } from 'typeorm';

import { Block } from '../../../shared';

@EntityRepository(Block)
export class BlockRepository extends Repository<Block> {
    public getMinHeight = async (operator_address: string) =>{
        const result = await this.createQueryBuilder()
        .select("height")
        .where({operator_address })
        .limit(1)
        .addOrderBy("height")
        .getRawOne();

        return result;
    }


    /**
     * Get latest top 100 blocks and latest missing 100 blocks by validator address for uptime detection
     * @param address: Validator address
     * @param topBlock: Number of blocks to get
     * @returns Array<TextRow>
     */
    async getBlockUptime(address: string, topBlock: number){
        const sql = `
        SELECT tmpBlock.height, tmpBlock.block_hash, (CASE WHEN tmpMiss.height = tmpBlock.height THEN 1 ELSE 0 END) isMissed FROM(
        SELECT height, block_hash, operator_address FROM blocks 
                    WHERE operator_address =? ORDER BY height DESC LIMIT ${topBlock}
        ) AS tmpBlock
            LEFT OUTER JOIN(
                SELECT validator_address, height FROM missed_block 
                    WHERE validator_address =? ORDER BY height DESC LIMIT ${topBlock}
        ) AS tmpMiss ON tmpBlock.operator_address = tmpMiss.validator_address`;
      
        return await this.query(sql, [address, address]);
    }
}
