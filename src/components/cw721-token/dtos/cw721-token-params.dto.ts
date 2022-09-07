import { ApiProperty } from "@nestjs/swagger";
import { Max, Min } from "class-validator";
import { PAGE_REQUEST } from "../../../shared";

export class Cw721TokenParamsDto {
    @ApiProperty({ default: 20})
    @Min(0)
    @Max(PAGE_REQUEST.MAX)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;

    @ApiProperty({default: ''})
    keyword: string;

    @ApiProperty({default: 'transfers_24h'})
    sort_column: string;

    @ApiProperty({default: 'desc'})
    sort_order: string;
}