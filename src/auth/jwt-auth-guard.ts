import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.get('authorization'); // FIXED HERE

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or Invalid Token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwt.verify(token);
      request.user = { userId: decoded.sub, role: decoded.role };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or Expired Token');
    }
  }
}
