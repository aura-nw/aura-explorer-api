import { DelegatorReward } from "../../../shared/entities/delegator-reward.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(DelegatorReward)
export class DelegatorRewardRepository extends Repository<DelegatorReward> {

    /**
     * Get reward by address
     * @param delegatorAddress 
     * @param validatorAdress 
     */
    async getRewardByAddress(delegatorAddress: string[], validatorAdress: string[]) {
        return await this.createQueryBuilder()
        .select('validator_address, delegator_address, SUM(amount) amount')
        .where(' delegator_address IN (:delegatorAddress) AND validator_address IN(:validatorAdress)')
        .setParameters({delegatorAddress, validatorAdress})
        .groupBy('validator_address, delegator_address')
        .getRawMany();
    }
}