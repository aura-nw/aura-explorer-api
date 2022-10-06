import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Min } from "class-validator";

export class NftByOwnerParamsDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Account address is required' })
    account_address: string;

    @ApiProperty({default: ''})
    keyword: string;

    @ApiProperty({ default: 4})
    @Min(0)
    limit: number;

    @ApiProperty({default: 0})
    @Min(0)
    offset: number;

    @ApiProperty({default: ''})
    next_key: string;
}