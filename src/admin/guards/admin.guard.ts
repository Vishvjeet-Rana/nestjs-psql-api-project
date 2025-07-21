import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    console.log('User from request:', request.user);

    const user = request.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }
}
