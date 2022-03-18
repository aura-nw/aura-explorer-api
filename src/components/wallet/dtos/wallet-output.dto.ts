import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class WalletOutput {
    @Expose()
    @ApiProperty()
    address: string;

    @Expose()
    @ApiProperty()
    balance: number = 0;

    @Expose()
    @ApiProperty()
    delegated: number = 0;

    @Expose()
    @ApiProperty()
    unbonding: number = 0;

    @Expose()
    @ApiProperty()
    stake_reward: number = 0;
}