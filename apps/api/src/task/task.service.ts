import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/* This service handles all business logic related to tasks within a workspace. 
   It ensures that users have the necessary permissions to perform actions on tasks and 
   interacts with the database through PrismaService.*/
@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  // Used to create a new task in a workspace. It checks if the user is a member of the workspace, if the projectId provided exists, and if the reporterId provided exists. If all checks pass, it creates the task.
  async createTask(
    workspaceId: string,
    userId: string,
    title: string,
    description?: string,
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
    projectId?: string,
    reporterId?: string,
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
        'Guests cannot create tasks',
      );
    }

    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          workspaceId,
        },
      });

      if (!project) {
        throw new NotFoundException(
          'Project not found in this workspace',
        );
      }
    }

    if (reporterId) {
      const reporter = await this.prisma.user.findUnique({
        where: {
          id: reporterId,
        },
      });

      if (!reporter) {
        throw new NotFoundException(
          'Reporter not found',
        );
      }
    }

    return this.prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        workspaceId,
        projectId,
        reporterId,
        dueDate,
      },
      include: {
        project: true,
        reporter: true,
      },
    });
  }

  // Used to get all tasks in a workspace. It checks if the user is a member of the workspace and then retrieves all tasks associated with that workspace, including related project and reporter information.
  async getWorkspaceTasks(
    workspaceId: string,
    userId: string,
    search?: string,
    status?: 'TODO' | 'DOING' | 'COMPLETED' | 'ON_HOLD',
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
    // 1. Check if the user belongs to the workspace
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

    // 2. Get tasks with optional search and status filters
    return this.prisma.task.findMany({
      where: {
        workspaceId,

        // Search by task title
        ...(search && {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        }),

        // Filter by status
        ...(status && {
          status,
        }),

        // Filter by priority
        ...(priority && {
          priority,
        }),

        // Filter by task member
        ...(memberId && {
          members: {
            some: {
              userId: memberId,
            },
          },
        }),

        // Filter by due date range
        ...(dueDateFrom || dueDateTo
          ? {
              dueDate: {
                ...(dueDateFrom && {
                  gte: new Date(dueDateFrom),
                }),

                ...(dueDateTo && {
                  lte: new Date(dueDateTo),
                }),
              },
            }
          : {}),

        // Filter by label
        ...(labelId && {
          labels: {
            some: {
              labelId,
            },
          },
        }),

        // Filter by reporter
        ...(reporterId && {
          reporterId,
        }),
      },

      include: {
        project: true,
        reporter: true,
        labels: {
          include: {
            label: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Used to get a specific task in a workspace. It checks if the user is a member of the workspace and then retrieves the task by its ID, including related project and reporter information. If the task does not exist or the user is not a member, it throws an appropriate exception.
  async getTask(
    workspaceId: string,
    taskId: string,
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

    // 2. Find the task inside this workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
      include: {
        project: true,
        reporter: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    // 3. Task doesn't exist
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  // Used to update a specific task in a workspace. It checks if the user is a member of the workspace, if the task exists, and if the provided projectId and reporterId (if any) are valid. It then updates only the fields that were provided in the request.
  async updateTask(
    workspaceId: string,
    taskId: string,
    userId: string,
    title?: string,
    description?: string,
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
    projectId?: string,
    reporterId?: string,
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
        'Guests cannot update tasks',
      );
    }
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    //  If a project is provided, make sure it belongs
    //    to the same workspace
    if (projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          workspaceId,
        },
      });

      if (!project) {
        throw new NotFoundException(
          'Project not found in this workspace',
        );
      }
    }

    //  If a reporter is provided, make sure the user exists
    if (reporterId) {
      const reporter = await this.prisma.user.findUnique({
        where: {
          id: reporterId,
        },
      });

      if (!reporter) {
        throw new NotFoundException('Reporter not found');
      }
    }

    //  Update only the fields that were provided
    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(projectId !== undefined && { projectId }),
        ...(reporterId !== undefined && { reporterId }),
        ...(dueDate !== undefined && { dueDate }),
      },
      include: {
        project: true,
        reporter: true,
      },
    });
  }

  // Used to delete a specific task in a workspace. It checks if the user is a member of the workspace and if the task exists. If both checks pass, it deletes the task from the database.
  async deleteTask(
    workspaceId: string,
    taskId: string,
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
        'Guests cannot delete tasks',
      );
    }
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 1. Delete the task
    return this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }

  // Used to add a member to a specific task in a workspace. It checks if the user is a member of the workspace, if the task exists, if the member user exists, and if the member user is also a member of the workspace. If all checks pass, it adds the member to the task.
  async addTaskMember(
    workspaceId: string,
    taskId: string,
    userId: string,
    memberUserId: string,
  ) {
    // 1. Check that the logged-in user belongs to the workspace
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
        'Guest users cannot add other members to tasks',
      );
    }

    // 2. Check that the task belongs to this workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Check that the user being added exists
    const memberUser = await this.prisma.user.findUnique({
      where: {
        id: memberUserId,
      },
    });

    if (!memberUser) {
      throw new NotFoundException('User not found');
    }

    // 4. Check that the user being added is a member
    //    of the same workspace
    const memberWorkspace =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: memberUserId,
            workspaceId,
          },
        },
      });

    if (!memberWorkspace) {
      throw new ForbiddenException(
        'User is not a member of this workspace',
      );
    }

    // 5. Guests cannot be assigned to tasks
    if (memberWorkspace.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot be assigned to tasks',
      );
    }

    // 6. Check if the user is already assigned
    const existingMember =
      await this.prisma.taskMember.findUnique({
        where: {
          taskId_userId: {
            taskId,
            userId: memberUserId,
          },
        },
      });

    if (existingMember) {
      throw new ForbiddenException(
        'User is already a member of this task',
      );
    }

    // 7. Add the user to the task
    return this.prisma.taskMember.create({
      data: {
        taskId,
        userId: memberUserId,
      },
      include: {
        user: true,
      },
    });
  }

  // Used to get all members assigned to a specific task in a workspace. It checks if the user is a member of the workspace and if the task exists. If both checks pass, it retrieves all members assigned to the task, including their user information.
  async getTaskMembers(
    workspaceId: string,
    taskId: string,
    userId: string,
  ) {
    // 1. Check that the logged-in user belongs to the workspace
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

    // 2. Check that the task belongs to this workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Get all members assigned to the task
    return this.prisma.taskMember.findMany({
      where: {
        taskId,
      },
      include: {
        user: true,
      },
    });
  }

  // Used to remove a member from a specific task in a workspace. It checks if the user is a member of the workspace, if the task exists, and if the member user is assigned to the task. If all checks pass, it removes the member from the task.
  async removeTaskMember(
    workspaceId: string,
    taskId: string,
    userId: string,
    memberUserId: string,
  ) {
    // 1. Check that the logged-in user belongs to the workspace
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
        'Guests cannot remove task members',
      );
    }
    // 2. Check that the task belongs to this workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Check that the task member exists
    const taskMember =
      await this.prisma.taskMember.findUnique({
        where: {
          taskId_userId: {
            taskId,
            userId: memberUserId,
          },
        },
      });

    if (!taskMember) {
      throw new NotFoundException(
        'User is not a member of this task',
      );
    }

    // 4. Remove the relationship
    return this.prisma.taskMember.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: memberUserId,
        },
      },
    });
  }
}


