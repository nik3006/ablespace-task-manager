import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Get the currently logged-in user's profile
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        title: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update the currently logged-in user's profile
  async updateMe(
    userId: string,
    fullName?: string,
    username?: string,
    title?: string,
    avatarUrl?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check username only if a new username was provided
    if (username !== undefined) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'Username is already taken',
        );
      }
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(username !== undefined && { username }),
        ...(title !== undefined && { title }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        title: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAvatar(
    userId: string,
    avatarUrl: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        title: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}