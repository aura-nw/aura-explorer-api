import { OmitType } from '@nestjs/swagger';
import { StoreNameTagParamsDto } from '../../name-tag/dtos/store-name-tag-params.dto';

export class CreatePrivateNameTagParamsDto extends OmitType(
  StoreNameTagParamsDto,
  ['id', 'userId', 'enterpriseUrl'] as const,
) {}
