//FIXME: delete this file because we don't use it anymore
import { EntityRepository, Repository } from 'typeorm';

import { Delegation } from '../../../shared';

@EntityRepository(Delegation)
export class DelegationRepository extends Repository<Delegation> {
    async getSumAmountByAddress(delegatorAddress: string) {
        return await this.createQueryBuilder("del")
            .select("SUM(del.amount)", "sum")
            .where({ delegator_address: delegatorAddress })
            .getRawOne();
    }
}
