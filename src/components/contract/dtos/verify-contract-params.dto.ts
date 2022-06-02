import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyContractParamsDto {
    @ApiProperty()
    @IsNotEmpty()
    contract_address: string;

    @ApiProperty()
    @IsString()
    url: string;

    @ApiProperty()
    @IsString()
    compiler_version: string;
}