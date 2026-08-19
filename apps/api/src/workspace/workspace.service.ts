import { 
  Injectable, 
  ForbiddenException, 
  ConflictException, 
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// This service handles all operations related to workspaces and their members. It ensures that users have the necessary permissions and that the data integrity is maintained.
@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  // Used to create a new workspace. The user creating the workspace will be the owner of the workspace.
  // Used to create a new workspace. The user creating the workspace will be the owner of the workspace.
  // Every new workspace also gets a predefined set of labels.
  async createWorkspace(name: string, userId: string) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name,

        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },

        labels: {
          createMany: {
            data: [
              {
                name: 'Bug',
                color: '#EF4444',
              },
              {
                name: 'Feature',
                color: '#3B82F6',
              },
              {
                name: 'Improvement',
                color: '#10B981',
              },
              {
                name: 'Documentation',
                color: '#8B5CF6',
              },
              {
                name: 'Design',
                color: '#EC4899',
              },
              {
                name: 'Testing',
                color: '#F59E0B',
              },
              {
                name: 'Urgent',
                color: '#DC2626',
              },
            ],
          },
        },
      },

      include: {
        members: true,
        labels: true,
      },
    });

    return workspace;
  }

  // Used to get all workspaces that the user is a member of.
  async getUserWorkspaces(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  // Used to get a specific workspace. The user must be a member of the workspace.
  async getWorkspace(workspaceId: string, userId: string) {
    return this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  // Used to update a specific workspace. The user must be the owner of the workspace.
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    name: string,
  ) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the workspace owner can update the workspace',
      );
    }

    return this.prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        name,
      },
    });
  }

  // Used to delete a specific workspace. The user must be the owner of the workspace.
  async deleteWorkspace(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the workspace owner can delete the workspace',
      );
    }

    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        projects: true,
        tasks: true,
        labels: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (
      workspace.projects.length > 0 ||
      workspace.tasks.length > 0 ||
      workspace.labels.length > 0
    ) {
      throw new ConflictException(
        'Workspace must be empty before it can be deleted',
      );
    }

    // Delete all workspace members before deleting the workspace
    await this.prisma.workspaceMember.deleteMany({
      where: {
        workspaceId,
      },
    });

    return this.prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  }

  // Used to get all members of a specific workspace. The user must be a member of the workspace.
  async getWorkspaceMembers(
    workspaceId: string,
    userId: string,
  ) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: true,
      },
    });
  }

  // Used to add a new member to a specific workspace. The user adding the member must be the owner of the workspace.
  async addWorkspaceMember(
    workspaceId: string,
    ownerId: string,
    userId: string,
  ) {
    const ownerMembership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ownerId,
            workspaceId,
          },
        },
      });

    if (!ownerMembership || ownerMembership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the workspace owner can add members',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this workspace',
      );
    }

    return this.prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId,
        role: 'MEMBER',
      },
      include: {
        user: true,
      },
    });
  }

  // Used to update the role of a member in a specific workspace. The user updating the role must be the owner of the workspace.
  async updateMemberRole(
    workspaceId: string,
    ownerId: string,
    memberId: string,
    role: 'OWNER' | 'MEMBER' | 'GUEST',
  ) {
    const ownerMembership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ownerId,
            workspaceId,
          },
        },
      });

    if (!ownerMembership || ownerMembership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the workspace owner can change member roles',
      );
    }

    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Workspace member not found');
    }

    if (member.role === 'OWNER' && role !== 'OWNER') {
      throw new ForbiddenException(
        'An owner cannot be demoted',
      );
    }

    return this.prisma.workspaceMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
      include: {
        user: true,
      },
    });
  }

  // Used to remove a member from a specific workspace. The user removing the member must be the owner of the workspace.
  async removeWorkspaceMember(
    workspaceId: string,
    ownerId: string,
    memberId: string,
  ) {
    const ownerMembership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: ownerId,
            workspaceId,
          },
        },
      });

    if (!ownerMembership || ownerMembership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the workspace owner can remove members',
      );
    }

    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundException('Workspace member not found');
    }

    if (member.userId === ownerId) {
      throw new ForbiddenException(
        'An owner cannot remove themselves from the workspace',
      );
    }

    return this.prisma.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });
  }

  // Used when the currently logged-in user wants to leave a workspace.
  async leaveWorkspace(
    workspaceId: string,
    userId: string,
  ) {
    const membership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'You are not a member of this workspace',
      );
    }

    // Workspace owners cannot leave their own workspace.
    if (membership.role === 'OWNER') {
      throw new ForbiddenException(
        'The workspace owner cannot leave the workspace',
      );
    }

    // Remove only this user's membership.
    return this.prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  }

  async getGuestAvailableWorkspaces() {
    return this.prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}