import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  // Get the logged-in user's profile
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() request: any) {
    return this.userService.getMe(
      request.user.userId,
    );
  }

  // Update the logged-in user's profile
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() request: any,
    @Body('fullName') fullName?: string,
    @Body('username') username?: string,
    @Body('title') title?: string,
    @Body('avatarUrl') avatarUrl?: string,
  ) {
    return this.userService.updateMe(
      request.user.userId,
      fullName,
      username,
      title,
      avatarUrl,
    );
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',

        filename: (req, file, callback) => {
          const filename = `${randomUUID()}${extname(file.originalname)}`;

          callback(null, filename);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('Only image files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @Req() request: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Avatar image is required',
      );
    }

    const avatarUrl =
      `http://localhost:4000/uploads/avatars/${file.filename}`;

    return this.userService.updateAvatar(
      request.user.userId,
      avatarUrl,
    );
  }
}