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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('guest')
  async guestLogin(
    @Body('workspaceId') workspaceId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.guestLogin(workspaceId);

    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: any) {
    return request.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', { path: '/' });

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleCallback(
    @Req() request: any,
    @Res() response: Response,
  ) {
    const result = await this.authService.googleLogin(request.user);

    response.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/');
  }
}