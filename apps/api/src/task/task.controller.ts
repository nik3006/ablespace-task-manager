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
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('workspaces/:workspaceId/tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Param('workspaceId') workspaceId: string,
    @Body('title') title: string,
    @Req() request: any,
    @Body('description') description?: string,
    @Body('status')
    status?:
      | 'TODO'
      | 'DOING'
      | 'COMPLETED'
      | 'ON_HOLD',
    @Body('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    @Body('projectId') projectId?: string,
    @Body('reporterId') reporterId?: string,
    @Body('dueDate') dueDate?: string,
  ) {
    return this.taskService.createTask(
      workspaceId,
      request.user.userId,
      title,
      description,
      status,
      priority,
      projectId,
      reporterId,
      dueDate ? new Date(dueDate) : undefined,
    );
  }

  // Used to get all tasks in a workspace.
  // Optional search searches tasks by title.
  @Get()
  @UseGuards(AuthGuard)
  async getWorkspaceTasks(
    @Param('workspaceId') workspaceId: string,
    @Req() request: any,

    // Search
    @Query('search') search?: string,

    // Status
    @Query('status')
    status?:
      | 'TODO'
      | 'DOING'
      | 'COMPLETED'
      | 'ON_HOLD',

    // Priority
    @Query('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',

    // Members
    @Query('memberId') memberId?: string,

    // Due date range
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,

    // Labels
    @Query('labelId') labelId?: string,

    // Reporter
    @Query('reporterId') reporterId?: string,
  ) {
    return this.taskService.getWorkspaceTasks(
      workspaceId,
      request.user.userId,
      search,
      status,
      priority,
      memberId,
      dueDateFrom,
      dueDateTo,
      labelId,
      reporterId,
    );
  }

  // Used to get a specific task in a workspace. The user must be a member of the workspace.
  @Get(':taskId')
  @UseGuards(AuthGuard)
  async getTask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
  ) {
    return this.taskService.getTask(
      workspaceId,
      taskId,
      request.user.userId,
    );
  }

  // Used to update a specific task in a workspace. The user must be a member of the workspace.
  @Patch(':taskId')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
    @Body('title') title?: string,
    @Body('description') description?: string,
    @Body('status')
    status?:
      | 'TODO'
      | 'DOING'
      | 'COMPLETED'
      | 'ON_HOLD',
    @Body('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    @Body('projectId') projectId?: string,
    @Body('reporterId') reporterId?: string,
    @Body('dueDate') dueDate?: string,
  ) {
    return this.taskService.updateTask(
      workspaceId,
      taskId,
      request.user.userId,
      title,
      description,
      status,
      priority,
      projectId,
      reporterId,
      dueDate ? new Date(dueDate) : undefined,
    );
  }

  // Used to delete a specific task in a workspace. The user must be a member of the workspace.
  @Delete(':taskId')
  @UseGuards(AuthGuard)
  async deleteTask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
  ) {
    return this.taskService.deleteTask(
      workspaceId,
      taskId,
      request.user.userId,
    );
  }

  // Used to add a member to a specific task in a workspace. The user must be a member of the workspace.
  @Post(':taskId/members')
  @UseGuards(AuthGuard)
  async addTaskMember(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
    @Body('userId') memberUserId: string,
  ) {
    return this.taskService.addTaskMember(
      workspaceId,
      taskId,
      request.user.userId,
      memberUserId,
    );
  }

  // Used to get all members of a specific task in a workspace. The user must be a member of the workspace.
  @Get(':taskId/members')
  @UseGuards(AuthGuard)
  async getTaskMembers(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() request: any,
  ) {
    return this.taskService.getTaskMembers(
      workspaceId,
      taskId,
      request.user.userId,
    );
  }

  // Used to remove a member from a specific task in a workspace. The user must be a member of the workspace.
  @Delete(':taskId/members/:memberUserId')
  @UseGuards(AuthGuard)
  async removeTaskMember(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('memberUserId') memberUserId: string,
    @Req() request: any,
  ) {
    return this.taskService.removeTaskMember(
      workspaceId,
      taskId,
      request.user.userId,
      memberUserId,
    );
  }
}
