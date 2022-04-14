import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProposalVoteByValidatorInput {
    @IsNotEmpty({message: 'Proposal id is required'})
    @ApiProperty()
    proposalId: number;

    @IsString()
    @ApiProperty()
    option: string;

    @ApiPropertyOptional({
        description: 'Optional, defaults to 5',
        type: Number,
      })
      @IsNumber()
      @IsOptional()
      @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
      limit = 5;
    
      @ApiPropertyOptional({ description: 'Optional, defaults to 0', type: Number })
      @IsNumber()
      @IsOptional()
      @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
      offset = 0;
}