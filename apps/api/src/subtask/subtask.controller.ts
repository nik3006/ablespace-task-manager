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

import { SubtaskService } from './subtask.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('workspaces/:workspaceId/tasks/:taskId/subtasks')
export class SubtaskController {
  constructor(
    private readonly subtaskService: SubtaskService,
  ) {}

  // Create a subtask
  @Post()
  @UseGuards(AuthGuard)
  async createSubtask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Body('title') title: string,
    @Req() request: any,
    @Body('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
  ) {
    return this.subtaskService.createSubtask(
      workspaceId,
      taskId,
      request.user.userId,
      title,
      priority,
    );
  }

  // Get all subtasks of a task
  @Get()
  @UseGuards(AuthGuard)
  async getSubtasks(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
  ) {
    return this.subtaskService.getSubtasks(
      workspaceId,
      taskId,
      request.user.userId,
    );
  }

  // Get a specific subtask
  @Get(':subtaskId')
  @UseGuards(AuthGuard)
  async getSubtask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Req() request: any,
  ) {
    return this.subtaskService.getSubtask(
      workspaceId,
      taskId,
      subtaskId,
      request.user.userId,
    );
  }

  // Update a subtask
  @Patch(':subtaskId')
  @UseGuards(AuthGuard)
  async updateSubtask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Req() request: any,
    @Body('title') title?: string,
    @Body('completed') completed?: boolean,
    @Body('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
  ) {
    return this.subtaskService.updateSubtask(
      workspaceId,
      taskId,
      subtaskId,
      request.user.userId,
      title,
      completed,
      priority,
    );
  }

  // Delete a subtask
  @Delete(':subtaskId')
  @UseGuards(AuthGuard)
  async deleteSubtask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Req() request: any,
  ) {
    return this.subtaskService.deleteSubtask(
      workspaceId,
      taskId,
      subtaskId,
      request.user.userId,
    );
  }
}