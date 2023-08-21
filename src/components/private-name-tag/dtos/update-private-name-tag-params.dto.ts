import { OmitType } from '@nestjs/swagger';
import { CreatePrivateNameTagParamsDto } from './create-private-name-tag-params.dto';

export class UpdatePrivateNameTagParamsDto extends OmitType(
  CreatePrivateNameTagParamsDto,
  ['address'] as const,
) {}
