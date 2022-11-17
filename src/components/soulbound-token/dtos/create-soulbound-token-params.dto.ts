import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { SOULBOUND_TOKEN_STATUS } from "../../../shared";

export class CreateSoulboundTokenParamsDto{
    @ApiProperty()
    @IsNotEmpty()
    smart_contract_id: number;

    @ApiProperty()
    @IsNotEmpty()
    receiver_address: string;

    @ApiProperty()
    @IsNotEmpty()
    status: SOULBOUND_TOKEN_STATUS;
}