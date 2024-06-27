import { PartialType } from '@nestjs/mapped-types';
import { CreateExplorerDto } from './create-explorer.dto';

export class UpdateExplorerDto extends PartialType(CreateExplorerDto) {}
