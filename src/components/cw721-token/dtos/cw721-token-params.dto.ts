import { ApiProperty } from "@nestjs/swagger";
import { Min } from "class-validator";

export class Cw721TokenParamsDto {
    @ApiProperty({ default: 20})
    @Min(0)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;

    @ApiProperty({default: ''})
    keyword: string;
}