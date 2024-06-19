import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, USER_ROLE, createRequestContext } from '../../shared';
import { UserService } from '../../components/user/user.service';
import { UserAuthorityService } from '../../components/user-authority/user-authority.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private userAuthority: UserAuthorityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log(`user: ${JSON.stringify(user)}`);
    const request = context.switchToHttp().getRequest();
    const ctx = createRequestContext(request);
    console.log(ctx.chainId);

    const userFound = await this.userService.findOneByEmail(user?.email);
    const userRole = userFound?.role || '';

    this.userAuthority.checkUserAuthority(userFound.id, ctx.chainId);
    return this.matchRoles(requiredRoles, userRole);
  }

  matchRoles(roles: string[], userRole: string): boolean {
    return roles.includes(userRole);
  }
}
