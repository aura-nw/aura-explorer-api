import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, USER_ROLE } from 'src/shared';
import { UserService } from 'src/components/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userFound = await this.userService.findOne({
      where: { email: user?.email },
    });
    const userRole = userFound?.role || '';
    return this.matchRoles(requiredRoles, userRole);
  }

  matchRoles(roles: string[], userRole: string) {
    return roles.includes(userRole);
  }
}
