import { ApiProperty } from '@nestjs/swagger';

export class BaseApiResponse<T> {
  public data: T;

  @ApiProperty({ type: Object })
  public meta: any;
}

export function SwaggerBaseApiResponse<T>(type: T): typeof BaseApiResponse {
  class ExtendedBaseApiResponse<T> extends BaseApiResponse<T> {
    @ApiProperty({ type })
    public data: T;
  }
  const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiResponse, 'name', {
    value: `SwaggerBaseApiResponseFor ${type} ${isAnArray}`,
  });

  return ExtendedBaseApiResponse;
}
