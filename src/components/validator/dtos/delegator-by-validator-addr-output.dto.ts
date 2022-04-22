import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class DelegatorByValidatorAddrOutputDto {

    @Expose()
    @ApiProperty()
    delegator_address: string;

    @Expose()
    @ApiProperty()
    amount: number;
}