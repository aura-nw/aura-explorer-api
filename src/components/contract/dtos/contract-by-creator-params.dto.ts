
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Max, Min } from "class-validator";
import { PAGE_REQUEST } from "../../../shared";

export class ContractByCreatorParamsDto {
    @ApiProperty()
    creatorAddress: string;

    @ApiPropertyOptional()
    codeId: number;

    @ApiPropertyOptional()
    status: string;

    @ApiProperty({type: 'number', maximum: PAGE_REQUEST.MAX, description: 'Number records per page and maximum is 100'})
    limit: number;

    @ApiProperty()
    offset: number;
}