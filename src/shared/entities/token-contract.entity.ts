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
    num_tokens: number;

    @Column()
    coin_id: string;

    @Column()
    max_total_supply: number;

    @Column()
    price: number;

    @Column()
    price_change_percentage_24h: number;

    @Column()
    volume_24h: number;

    @Column()
    circulating_market_cap: number;

    @Column()
    fully_diluted_market_cap: number;

    @Column()
    holders: number;

    @Column()
    holders_change_percentage_24h: number;
}