import { ApiProperty } from "@nestjs/swagger";
import { Min } from "class-validator";

export class Cw20TokenParamsDto {
    @ApiProperty({ default: 20})
    @Min(1)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;

    @ApiProperty({default: ''})
    keyword: string;
}