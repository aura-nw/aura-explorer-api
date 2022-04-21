import { DelegatorReward } from "../../../shared/entities/delegator-reward.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(DelegatorReward)
export class DelegatorRewardRepository extends Repository<DelegatorReward> {}