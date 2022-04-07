import { Column, Entity } from "typeorm";
import { BaseEntityIncrementId } from "./base/base.entity";

@Entity('block-sync-error')
export class BlockSyncError extends BaseEntityIncrementId {
    @Column()
    height: number;

    @Column()
    block_hash: string;
}