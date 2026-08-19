import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

// This service handles all operations related to projects within a workspace.
// It ensures that users have the necessary permissions and that the data
// integrity is maintained.
@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  /* Used to create a new project in a workspace.
     It checks if the user is a member of the workspace
     and if the leadId provided exists. */
  async createProject(
    workspaceId: string,
    userId: string,
    name: string,
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    leadId?: string,
    dueDate?: Date,
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

    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot create projects',
      );
    }

    if (leadId) {
      const lead = await this.prisma.user.findUnique({
        where: {
          id: leadId,
        },
      });

      if (!lead) {
        throw new NotFoundException('Project lead not found');
      }
    }

    return this.prisma.project.create({
      data: {
        name,
        priority,
        workspaceId,
        leadId,
        dueDate,
      },
      include: {
        lead: true,
      },
    });
  }

  /* Used to get all projects in a workspace with optional filters. */
  async getWorkspaceProjects(
    workspaceId: string,
    userId: string,
    search?: string,
    status?:
      | 'TODO'
      | 'DOING'
      | 'COMPLETED'
      | 'ON_HOLD',
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    memberId?: string,
    dueDateFrom?: string,
    dueDateTo?: string,
    labelId?: string,
    reporterId?: string,
  ) {
    // 1. Check workspace membership
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
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    // 2. Build task-related filters
    const taskFilters: any[] = [];

    // Status filter
    if (status) {
      taskFilters.push({
        status,
      });
    }

    // Members filter
    if (memberId) {
      taskFilters.push({
        members: {
          some: {
            userId: memberId,
          },
        },
      });
    }

    // Labels filter
    if (labelId) {
      taskFilters.push({
        labels: {
          some: {
            labelId,
          },
        },
      });
    }

    // Reporter filter
    if (reporterId) {
      taskFilters.push({
        reporterId,
      });
    }

    // 3. Get projects with filters
    return this.prisma.project.findMany({
      where: {
        workspaceId,

        // Search by project name
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),

        // Priority filter
        ...(priority && {
          priority,
        }),

        // Due date range filter
        ...((dueDateFrom || dueDateTo) && {
          dueDate: {
            ...(dueDateFrom && {
              gte: new Date(dueDateFrom),
            }),

            ...(dueDateTo && {
              lte: new Date(dueDateTo),
            }),
          },
        }),

        // Apply all task-related filters
        ...(taskFilters.length > 0 && {
          AND: taskFilters.map((filter) => ({
            tasks: {
              some: filter,
            },
          })),
        }),
      },

      // Include project lead and tasks
      include: {
        lead: true,
        tasks: true,
      },

      // Newest projects first
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /* Used to get a specific project in a workspace.
     It checks if the user is a member of the workspace
     and returns the project together with its tasks. */
  async getProject(
    workspaceId: string,
    projectId: string,
    userId: string,
  ) {
    // 1. Check workspace membership
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
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    // 2. Find the project inside this workspace
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },

      // IMPORTANT:
      // Return both the project lead and all tasks
      // belonging to this project.
      include: {
        lead: true,
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  /* Used to update a specific project in a workspace.
     It checks if the user is a member of the workspace
     and if the leadId provided exists. */
  async updateProject(
    workspaceId: string,
    projectId: string,
    userId: string,
    name?: string,
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    leadId?: string,
    dueDate?: Date,
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
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot update projects',
      );
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (leadId) {
      const lead = await this.prisma.user.findUnique({
        where: {
          id: leadId,
        },
      });

      if (!lead) {
        throw new NotFoundException('Project lead not found');
      }
    }

    return this.prisma.project.update({
      where: {
        id: projectId,
      },

      // Only update fields that were provided
      data: {
        ...(name !== undefined && { name }),
        ...(priority !== undefined && { priority }),
        ...(leadId !== undefined && { leadId }),
        ...(dueDate !== undefined && { dueDate }),
      },

      include: {
        lead: true,
      },
    });
  }

  /* Used to delete a specific project in a workspace.
     The project must be empty before it can be deleted. */
  async deleteProject(
    workspaceId: string,
    projectId: string,
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
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot delete projects',
      );
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId,
      },

      include: {
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.tasks.length > 0) {
      throw new ConflictException(
        'Project must be empty before it can be deleted',
      );
    }

    return this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }
}