import { Column, Entity, Unique } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('nfts')
@Unique(['contract_address', 'token_id'])
export class Nft extends BaseEntityIncrementId {
    @Column()
    contract_address: string;

    @Column()
    token_id: string;

    @Column()
    owner: string;

    @Column()
    uri: string;
}