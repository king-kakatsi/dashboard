import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token: string | null = null;

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }

    // Extract token from cookie
    if (!token && request.cookies?.access_token) {
      token = request.cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const user = await this.authService.verifyToken(token);
      request.user = user;

      // Check role-based access
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        throw new UnauthorizedException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
