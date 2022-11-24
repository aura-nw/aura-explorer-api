import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { SOULBOUND_TOKEN_STATUS } from "../../../shared";

export class UpdateSoulboundTokenParamsDto {
    @ApiProperty()
    @IsNotEmpty()
    id: number;

    @ApiProperty()
    signature: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(SOULBOUND_TOKEN_STATUS)
    status: SOULBOUND_TOKEN_STATUS;
}