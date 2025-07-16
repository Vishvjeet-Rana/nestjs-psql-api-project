import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header['authorizatioin'];

    if (!authHeader?.startWith('Bearer ')) {
      throw new UnauthorizedException('Missing or Invalid Token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decode = this.jwt.verify(token);
      request.user = { userId: decode.sub, role: decode.role };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or Expired Token');
    }
  }
}
