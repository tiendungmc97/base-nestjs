import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
  handleRequest(err, user, info) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          code: 402,
          message: 'Token has expired',
        });
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          code: 401,
          message: 'Token is invalid',
        });
      } else if (info instanceof NotBeforeError) {
        throw new UnauthorizedException({
          code: 401,
          message: 'Token not active',
        });
      } else {
        throw new UnauthorizedException({
          code: 401,
          message: 'Token error',
        });
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
