import { OmitType, PartialType } from '@nestjs/swagger';
import { AssetParamsDto } from 'src/components/asset/dtos/asset-params.dto';

export class ExplorerParamsDto extends PartialType(
  OmitType(AssetParamsDto, ['type'] as const),
) {}
