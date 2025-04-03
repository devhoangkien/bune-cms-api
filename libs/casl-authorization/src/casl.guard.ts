import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from './ability.factory';
import { CHECK_PERMISSIONS } from './check-permissions.decorator';
import { ICaslPermission } from './interfaces';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private abilityFactory: AbilityFactory,
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req.user;
    const permissions: ICaslPermission[] = req.permissions;

    if (!user || !permissions) return false;

    const ability = this.abilityFactory.createForPermissions(permissions);

    const permission = this.reflector.get<ICaslPermission>(CHECK_PERMISSIONS, context.getHandler());
    if (permission) {
      return ability.can(permission.action, permission.subject)
    }

    return false;
  }
}
