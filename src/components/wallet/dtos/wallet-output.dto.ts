import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class WalletOutput {
    @Expose()
    @ApiProperty()
    address: string;

    @Expose()
    @ApiProperty()
    balance: [] = [];

    @Expose()
    @ApiProperty()
    delegated: [] = [];

    @Expose()
    @ApiProperty()
    unbonding: [] = [];

    @Expose()
    @ApiProperty()
    stake_reward: [] = [];

    @Expose()
    @ApiProperty()
    auth_info: [] = [];
}