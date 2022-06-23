import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min } from "class-validator";

export class ContractParamsDto {
    @ApiProperty({ default: 20})
    @Min(0)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;

    @ApiProperty({default: ''})
    keyword: string;
}