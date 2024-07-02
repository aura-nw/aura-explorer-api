import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, MaxLength } from 'class-validator';

export class UpdateAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  coinId: string;

  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  verifyStatus: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  officialSite: string;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/...',
      twitter: 'https://twitter.com/...',
      facebook: 'https://facebook.com/...',
      email: 'example@aura.network',
    },
  })
  @IsOptional()
  @IsObject()
  socialProfiles: JSON;

  @ApiPropertyOptional()
  @IsOptional()
  overviewInfo: string;
}
