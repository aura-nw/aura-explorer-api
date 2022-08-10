import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min } from "class-validator";

export class TokenTransactionParamsDto {
    @IsNotEmpty()
    @ApiProperty()
    contract_address: string;

    @ApiProperty({default: ''})
    account_address: string;

    @ApiProperty({default: ''})
    tx_hash: string;
    
    @ApiProperty({ default: 20})
    @Min(1)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;
}