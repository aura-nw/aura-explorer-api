import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('token_contracts')
export class TokenContract extends BaseEntityIncrementId {
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
    decimal: number;

    @Column()
    max_total_supply: number;

    @Column()
    is_main_token: boolean;
}