import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, USER_ROLE } from '../../shared';

export const Roles = (...roles: USER_ROLE[]) => SetMetadata(ROLES_KEY, roles);
