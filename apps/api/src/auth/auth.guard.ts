import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/* This guard is used to protect routes that require authentication. 
   It checks for the presence of a valid JWT in the request cookies and verifies it. 
   If the token is valid, it attaches the decoded payload to the request object for further use in the route handler. 
   If the token is missing or invalid, it throws an UnauthorizedException.*/
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  // The canActivate method is called by the NestJS framework to determine if a request should be allowed to proceed.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}