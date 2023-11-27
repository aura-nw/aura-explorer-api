import { PartialType } from '@nestjs/swagger';
import { CreateCw20TokenDto } from './create-cw20-token.dto';

export class UpdateCw20TokenDto extends PartialType(CreateCw20TokenDto) {
  id: number;
}
