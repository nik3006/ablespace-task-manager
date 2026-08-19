import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TaskUpdateService } from './task-update.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller(
  'workspaces/:workspaceId/tasks/:taskId/updates',
)
export class TaskUpdateController {
  constructor(
    private readonly taskUpdateService: TaskUpdateService,
  ) {}

  // Create an update/comment on a task
  @Post()
  @UseGuards(AuthGuard)
  async createUpdate(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Body('content') content: string,
    @Req() request: any,
  ) {
    return this.taskUpdateService.createUpdate(
      workspaceId,
      taskId,
      request.user.userId,
      content,
    );
  }

  // Get all updates/comments of a task
  @Get()
  @UseGuards(AuthGuard)
  async getTaskUpdates(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
  ) {
    return this.taskUpdateService.getTaskUpdates(
      workspaceId,
      taskId,
      request.user.userId,
    );
  }

  // Get one update/comment
  @Get(':updateId')
  @UseGuards(AuthGuard)
  async getUpdate(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('updateId') updateId: string,
    @Req() request: any,
  ) {
    return this.taskUpdateService.getUpdate(
      workspaceId,
      taskId,
      updateId,
      request.user.userId,
    );
  }

  // Update a comment
  @Patch(':updateId')
  @UseGuards(AuthGuard)
  async updateUpdate(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('updateId') updateId: string,
    @Req() request: any,
    @Body('content') content?: string,
  ) {
    return this.taskUpdateService.updateUpdate(
      workspaceId,
      taskId,
      updateId,
      request.user.userId,
      content,
    );
  }

  // Delete a comment
  @Delete(':updateId')
  @UseGuards(AuthGuard)
  async deleteUpdate(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('updateId') updateId: string,
    @Req() request: any,
  ) {
    return this.taskUpdateService.deleteUpdate(
      workspaceId,
      taskId,
      updateId,
      request.user.userId,
    );
  }
}