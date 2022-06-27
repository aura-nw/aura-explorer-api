import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class SearchTransactionParamsDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Contract address is required' })
    contract_address: string;

    @ApiProperty()
    @IsString()
    label: string;

    @ApiProperty({ default: 25})
    @IsNumber()
    limit: number;

    @ApiProperty({default: 0})
    @IsNumber()
    offset: number;
}