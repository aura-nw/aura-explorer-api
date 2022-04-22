import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsString, IsNotEmpty } from "class-validator";

export class DelegatorByValidatorAddrParamsDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty({message: 'Validator address is required'})
    validatorAddress: string;

    @ApiPropertyOptional({
        description: 'Optional, defaults to 5',
        type: Number,
      })
      @IsNumber()
      @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
      limit = 5;
    
      @ApiPropertyOptional({ description: 'Optional, defaults to 0', type: Number })
      @IsNumber()
      @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
      offset = 0;
}