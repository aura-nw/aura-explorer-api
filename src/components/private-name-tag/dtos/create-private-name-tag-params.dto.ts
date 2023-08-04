import { OmitType } from '@nestjs/swagger';
import { StorePublicNameTagParamsDto } from '../../public-name-tag/dtos/store-public-name-tag-params.dto';

export class CreatePrivateNameTagParamsDto extends OmitType(
  StorePublicNameTagParamsDto,
  ['id', 'userId', 'enterpriseUrl'] as const,
) {}
