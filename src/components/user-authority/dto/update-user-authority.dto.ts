import { PartialType } from '@nestjs/mapped-types';
import { AddUserAuthorityDto } from './create-user-authority.dto';

export class UpdateUserAuthorityDto extends PartialType(AddUserAuthorityDto) {}
