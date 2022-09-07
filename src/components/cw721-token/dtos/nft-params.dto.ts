import { ApiProperty } from "@nestjs/swagger";
import { Max, Min } from "class-validator";
import { PAGE_REQUEST } from "../../../shared";

export class NftParamsDto {
    @ApiProperty({ default: 20})
    @Min(1)
    @Max(PAGE_REQUEST.MAX)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;

    @ApiProperty({default: ''})
    token_id: string;

    @ApiProperty({default: ''})
    owner: string;
}