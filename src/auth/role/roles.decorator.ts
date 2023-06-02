import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, USER_ROLE } from 'src/shared';

export const Roles = (...roles: USER_ROLE[]) => SetMetadata(ROLES_KEY, roles);
