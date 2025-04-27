
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    const headers = ctx.req.headers;
    const userId = headers['userid'] || headers['user-id'] || headers['userId'];
    if (!userId) {
      throw new UnauthorizedException('Unauthorized: User not logged in');
    }

    return true;
  }
}
