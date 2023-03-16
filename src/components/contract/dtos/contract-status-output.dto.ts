import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ContractStatusOutputDto{
    @Expose()
    key: String;

    @Expose()
    label: String;
}