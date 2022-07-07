import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyContractParamsDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Contract address is required' })
    contract_address: string;
    
    @ApiProperty()
    @IsString()
    commit: string;

    @ApiProperty()
    @IsString()
    url: string;

    @ApiProperty()
    @IsString()
    compiler_version: string;

    @ApiProperty()
    @IsString()
    wasm_file: string;
}