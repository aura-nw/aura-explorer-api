import { Column, Entity, Unique } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('delegator_rewards')
export class DelegatorReward extends BaseEntityIncrementId {
    @Column()
    delegator_address: string;

    @Column()
    validator_address: string;

    @Column()
    amount: number;

    @Unique('tx_hash', ['tx_hash'])
    @Column()
    tx_hash: string;
}