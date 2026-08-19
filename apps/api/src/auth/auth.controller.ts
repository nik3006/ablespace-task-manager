import {
  Controller,
  Get,
  Body,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

// This controller handles all HTTP requests related to authentication. It provides endpoints for guest login, Google OAuth login, and retrieving the authenticated user's information. It uses the AuthService to perform the actual business logic and the AuthGuard to protect certain routes.
// This controller uses the service available in auth.service.ts to perform the actual business logic. It provides endpoints for guest login, Google OAuth login, and retrieving the authenticated user's information.
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Used to log in a guest user. It creates a new user with the name "Guest User" and generates a JWT token for the user.
  @Post('guest')
  async guestLogin(
    @Body('workspaceId') workspaceId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
  const result = await this.authService.guestLogin(workspaceId);

    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
    };
  }

  // Used to get the authenticated user's information. The user must be authenticated to access this endpoint.
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: any) {
    return request.user;
  }

  // Used to log out the authenticated user. It clears the JWT token from the cookies.
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
  response.clearCookie('access_token', { path: '/' });

    return {
      message: 'Logged out successfully',
    };
  }

  // Used to initiate the Google OAuth login flow. It redirects the user to Google's login page.
  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  googleLogin() {}

  // Used as the callback endpoint for Google OAuth login. It retrieves the user's profile information from Google, logs in the user, and generates a JWT token.
  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleCallback(
    @Req() request: any,
    @Res() response: Response,
  ) {
    const result = await this.authService.googleLogin(request.user);

    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.redirect('http://localhost:3000/');
  }
}