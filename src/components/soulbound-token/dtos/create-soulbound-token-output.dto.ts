import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { SOULBOUND_TOKEN_STATUS } from "../../../shared";

export class CreateSoulboundTokenOutputDto{
    attestor_address: string;
    contract_address: string;
    receiver_address: string;
    token_id: string;
    token_uri: string;
    status: string;
}