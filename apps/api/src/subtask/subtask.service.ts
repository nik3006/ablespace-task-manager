import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SubtaskService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a subtask
  async createSubtask(
    workspaceId: string,
    taskId: string,
    userId: string,
    title: string,
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
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

    // 2. Guests cannot create subtasks
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot create subtasks',
      );
    }

    // 3. Check that task belongs to workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 4. Create subtask
    return this.prisma.subtask.create({
      data: {
        title,
        priority,
        taskId,
      },
    });
  }

  // Get all subtasks of a task
  async getSubtasks(
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

    // 2. Check task
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Get subtasks
    return this.prisma.subtask.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Get one subtask
  async getSubtask(
    workspaceId: string,
    taskId: string,
    subtaskId: string,
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

    // 2. Find subtask belonging to this task
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
        task: {
          workspaceId,
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    return subtask;
  }

  // Update a subtask
  async updateSubtask(
    workspaceId: string,
    taskId: string,
    subtaskId: string,
    userId: string,
    title?: string,
    completed?: boolean,
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
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

    // 2. Guests cannot update subtasks
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot update subtasks',
      );
    }

    // 3. Find subtask
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
        task: {
          workspaceId,
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    // 4. Update only provided fields
    return this.prisma.subtask.update({
      where: {
        id: subtaskId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
      },
    });
  }

  // Delete a subtask
  async deleteSubtask(
    workspaceId: string,
    taskId: string,
    subtaskId: string,
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

    // 2. Guests cannot delete subtasks
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot delete subtasks',
      );
    }

    // 3. Find subtask
    const subtask = await this.prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
        task: {
          workspaceId,
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    // 4. Delete
    return this.prisma.subtask.delete({
      where: {
        id: subtaskId,
      },
    });
  }
}