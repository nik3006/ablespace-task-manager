import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TaskUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  // Create an update/comment on a task
  async createUpdate(
    workspaceId: string,
    taskId: string,
    userId: string,
    content: string,
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

    // 2. Guests cannot create updates
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot create updates',
      );
    }

    // 3. Check that the task exists in this workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 4. Create the update
    return this.prisma.taskUpdate.create({
      data: {
        content,
        taskId,
        authorId: userId,
      },
    });
  }

  // Get all updates/comments on a task
  async getTaskUpdates(
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

    // 2. Check that the task exists in this workspace
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        workspaceId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Get updates
    return this.prisma.taskUpdate.findMany({
      where: {
        taskId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Get one update/comment
  async getUpdate(
    workspaceId: string,
    taskId: string,
    updateId: string,
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

    // 2. Find update belonging to this task and workspace
    const update = await this.prisma.taskUpdate.findFirst({
      where: {
        id: updateId,
        taskId,
        task: {
          workspaceId,
        },
      },
      include: {
        author: true,
      },
    });

    if (!update) {
      throw new NotFoundException('Update not found');
    }

    return update;
  }

  // Update a comment
  async updateUpdate(
    workspaceId: string,
    taskId: string,
    updateId: string,
    userId: string,
    content?: string,
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

    // 2. Guests cannot update comments
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot update comments',
      );
    }

    // 3. Find update
    const update = await this.prisma.taskUpdate.findFirst({
      where: {
        id: updateId,
        taskId,
        task: {
          workspaceId,
        },
      },
    });

    if (!update) {
      throw new NotFoundException('Update not found');
    }

    // 4. Update only provided fields
    return this.prisma.taskUpdate.update({
      where: {
        id: updateId,
      },
      data: {
        ...(content !== undefined && { content }),
      },
    });
  }

  // Delete a comment
  async deleteUpdate(
    workspaceId: string,
    taskId: string,
    updateId: string,
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

    // 2. Guests cannot delete comments
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot delete comments',
      );
    }

    // 3. Find update
    const update = await this.prisma.taskUpdate.findFirst({
      where: {
        id: updateId,
        taskId,
        task: {
          workspaceId,
        },
      },
    });

    if (!update) {
      throw new NotFoundException('Update not found');
    }

    // 4. Delete
    return this.prisma.taskUpdate.delete({
      where: {
        id: updateId,
      },
    });
  }
}