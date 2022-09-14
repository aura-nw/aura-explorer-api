import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ContractStatusOutputDto{
    @Expose()
    @ApiProperty()
    key: String;

    @Expose()
    @ApiProperty()
    label: String;
}