import { OmitType, PartialType } from '@nestjs/swagger';
import { AddUserAuthorityDto } from './create-user-authority.dto';

export class UserAuthorityDto extends PartialType(
  OmitType(AddUserAuthorityDto, ['explorerId'] as const),
) {}
