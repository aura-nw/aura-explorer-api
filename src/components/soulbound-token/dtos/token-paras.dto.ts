import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, Max } from "class-validator";
import { PAGE_REQUEST } from "../../../shared";

export class TokenParasDto{
    @ApiProperty()
    minterAddress: string;

    @ApiProperty()
    contractAddress: string;

    @ApiPropertyOptional({ description: 'Optional, defaults to 100', type: Number })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, PAGE_REQUEST.MAX), { toClassOnly: true })
    @Max(PAGE_REQUEST.MAX)
    limit: number = PAGE_REQUEST.MAX;

    @ApiProperty()
    offset: number;
}