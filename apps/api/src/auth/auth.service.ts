import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { WorkspaceService } from '../workspace/workspace.service';

// This service handles authentication-related operations,
// including guest login and Google login.
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private workspaceService: WorkspaceService,
  ) {}

  /* Used to log in a guest user.
     It creates a new user with the name "Guest User"
     and adds them to the selected workspace as a GUEST. */
  async guestLogin(workspaceId: string) {
    const workspace =
      await this.prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found',
      );
    }

    const user =
      await this.prisma.user.create({
        data: {
          fullName: 'Guest User',
        },
      });

    await this.prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role: 'GUEST',
      },
    });

    const token =
      this.jwtService.sign({
        userId: user.id,
      });

    return {
      user,
      token,
    };
  }

  /* Used to log in a user using their Google profile.
     If the user is new, a default workspace is
     automatically created for them. */
  async googleLogin(profile: any) {
    const email =
      profile.emails?.[0]?.value;

    let user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    // NEW USER
    if (!user) {
      user =
        await this.prisma.user.create({
          data: {
            email,
            fullName:
              profile.displayName,
            avatarUrl:
              profile.photos?.[0]?.value,
          },
        });

      // Automatically create the user's first workspace
      await this.workspaceService.createWorkspace(
        `${user.fullName}'s Workspace`,
        user.id,
      );
    }

    const token =
      this.jwtService.sign({
        userId: user.id,
      });

    return {
      user,
      token,
    };
  }
}