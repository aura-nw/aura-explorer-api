import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { SOULBOUND_TOKEN_STATUS } from "../../../shared";

export class UpdateSoulboundTokenParamsDto {
    @ApiProperty()
    @IsNotEmpty()
    id: number;

    @ApiProperty()
    signature: string;

    @ApiProperty()
    @IsNotEmpty()
    status: SOULBOUND_TOKEN_STATUS;
}