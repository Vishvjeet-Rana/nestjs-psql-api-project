import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token found in request');
      throw new UnauthorizedException('Token not found');
    }

    try {
      this.logger.log(`Token to verify: ${token}`);

      // Get the secret from config service
      const secret = this.configService.get<string>('JWT_SECRET');
      this.logger.log(`Using secret: ${secret}`);

      if (!secret) {
        this.logger.error('JWT_SECRET not found in configuration');
        throw new UnauthorizedException('JWT configuration error');
      }

      // Verify token with explicit secret
      const payload = this.jwtService.verify(token, { secret });
      this.logger.log(
        `Token verified successfully. Payload: ${JSON.stringify(payload)}`,
      );

      // Attach user info to request
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(
        `JWT verification error: ${error.constructor.name}: ${error.message}`,
      );
      this.logger.error(`Error stack: ${error.stack}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
