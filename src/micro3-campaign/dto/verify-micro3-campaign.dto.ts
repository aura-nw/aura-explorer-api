import { IsNotEmpty } from 'class-validator';
import { ACTION_TYPE } from '../const/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CampaignParamDto {
  @ApiProperty({ default: '' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  chainId: string;

  @ApiProperty({
    enum: ACTION_TYPE,
    type: ACTION_TYPE,
    default: ACTION_TYPE.MintNft,
  })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  action: ACTION_TYPE;

  @ApiProperty({ default: '' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  address: string;

  @ApiProperty({ default: '10' })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  amount: string;

  // @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  uniVersion: number;
}

export interface ResultDto {
  result: boolean;
}

type SuccessResponse<T> = {
  data: T | any;
};

type ErrorResponse<T> = {
  error: {
    code: number;
    message: string;
  };
  data: T | any;
};
export type CampaignResponseDto<T> = SuccessResponse<T> | ErrorResponse<T>;

export function onError<T>(
  code: number,
  message: string,
  data: T,
): ErrorResponse<T> {
  return {
    error: {
      code,
      message,
    },
    data,
  };
}

export function onSuccess<T>(data?: T): SuccessResponse<T> {
  return {
    data: data || null,
  };
}
