import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LabelService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a label
  async createLabel(
    workspaceId: string,
    userId: string,
    name: string,
    color: string,
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
        'Guests cannot create labels',
      );
    }

    return this.prisma.label.create({
      data: {
        name,
        color,
        workspaceId,
      },
    });
  }

  // Get all labels in a workspace
  async getWorkspaceLabels(
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
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    return this.prisma.label.findMany({
      where: {
        workspaceId,
      },
      include: {
        tasks: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Get one label
  async getLabel(
    workspaceId: string,
    labelId: string,
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

    const label = await this.prisma.label.findFirst({
      where: {
        id: labelId,
        workspaceId,
      },
      include: {
        tasks: true,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  // Update a label
  async updateLabel(
    workspaceId: string,
    labelId: string,
    userId: string,
    name?: string,
    color?: string,
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
        'Guests cannot update labels',
      );
    }

    const label = await this.prisma.label.findFirst({
      where: {
        id: labelId,
        workspaceId,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return this.prisma.label.update({
      where: {
        id: labelId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
      },
    });
  }

  // Delete a label
  async deleteLabel(
    workspaceId: string,
    labelId: string,
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
        'Guests cannot delete labels',
      );
    }

    const label = await this.prisma.label.findFirst({
      where: {
        id: labelId,
        workspaceId,
      },
      include: {
        tasks: true,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    if (label.tasks.length > 0) {
      throw new ConflictException(
        'Label must be removed from all tasks before it can be deleted',
      );
    }

    return this.prisma.label.delete({
      where: {
        id: labelId,
      },
    });
  }


  // Attach a label to a task
  async attachLabelToTask(
    workspaceId: string,
    taskId: string,
    labelId: string,
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

    // 2. Guests cannot attach labels
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot attach labels to tasks',
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

    // 4. Check that the label exists in this workspace
    const label = await this.prisma.label.findFirst({
      where: {
        id: labelId,
        workspaceId,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    // 5. Check if the label is already attached
    const existingTaskLabel =
      await this.prisma.taskLabel.findUnique({
        where: {
          taskId_labelId: {
            taskId,
            labelId,
          },
        },
      });

    if (existingTaskLabel) {
      throw new ConflictException(
        'Label is already attached to this task',
      );
    }

    // 6. Attach the label
    return this.prisma.taskLabel.create({
      data: {
        taskId,
        labelId,
      },
    });
  }


  // Remove a label from a task
  async removeLabelFromTask(
    workspaceId: string,
    taskId: string,
    labelId: string,
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

    // 2. Guests cannot remove labels
    if (membership.role === 'GUEST') {
      throw new ForbiddenException(
        'Guests cannot remove labels from tasks',
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

    // 4. Check that the label exists in this workspace
    const label = await this.prisma.label.findFirst({
      where: {
        id: labelId,
        workspaceId,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    // 5. Check that the label is attached to the task
    const taskLabel =
      await this.prisma.taskLabel.findUnique({
        where: {
          taskId_labelId: {
            taskId,
            labelId,
          },
        },
      });

    if (!taskLabel) {
      throw new NotFoundException(
        'Label is not attached to this task',
      );
    }

    // 6. Remove the label
    return this.prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }
}