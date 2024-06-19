import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAuthorityDto } from './create-user-authority.dto';

export class UpdateUserAuthorityDto extends PartialType(
  CreateUserAuthorityDto,
) {}
