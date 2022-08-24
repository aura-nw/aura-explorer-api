import { Column, Entity } from "typeorm";
import { CONTRACT_TYPE } from "../constants";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('token_contracts')
export class TokenContract extends BaseEntityIncrementId {
    @Column({
        type: 'enum',
        enum: CONTRACT_TYPE
    })
    type: CONTRACT_TYPE;

    @Column()
    name: string;

    @Column()
    symbol: string;

    @Column()
    image: string;

    @Column()
    description: string;

    @Column()
    contract_address: string;

    @Column()
    decimals: number;

    @Column()
    total_supply: number;

    @Column()
    num_tokens: number;

    @Column()
    coin_id: string;
}