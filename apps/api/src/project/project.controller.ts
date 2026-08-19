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
import { ProjectService } from './project.service';
import { AuthGuard } from '../auth/auth.guard';

// This controller handles all HTTP requests related to projects within a workspace. It ensures that users have the necessary permissions to perform actions on projects and delegates the actual business logic to the ProjectService.
//This controller uses the service available in project.service.ts to perform the actual business logic. It ensures that users have the necessary permissions to perform actions on projects within a workspace.
@Controller('workspaces/:workspaceId/projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) {}

  // Used to Create a project in a workspace. The user creating the project must be a member of the workspace.
  @Post()
  @UseGuards(AuthGuard)
  async createProject(
    @Param('workspaceId') workspaceId: string,
    @Body('name') name: string,
    @Req() request: any,
    @Body('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    @Body('leadId') leadId?: string,
    @Body('dueDate') dueDate?: string,
  ) {
    return this.projectService.createProject(
      workspaceId,
      request.user.userId,
      name,
      priority,
      leadId,
      dueDate ? new Date(dueDate) : undefined,
    );
  }

  // Used to get all projects in a workspace. The user must be a member of the workspace.
  // Used to get all projects in a workspace with optional filters.
  @Get()
  @UseGuards(AuthGuard)
  async getWorkspaceProjects(
    @Param('workspaceId') workspaceId: string,
    @Req() request: any,

    @Query('search') search?: string,

    @Query('status')
    status?:
      | 'TODO'
      | 'DOING'
      | 'COMPLETED'
      | 'ON_HOLD',

    @Query('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',

    @Query('memberId') memberId?: string,

    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,

    @Query('labelId') labelId?: string,

    @Query('reporterId') reporterId?: string,
  ) {
    return this.projectService.getWorkspaceProjects(
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

  // Used to get a specific project in a workspace. The user must be a member of the workspace.
  @Get(':projectId')
  @UseGuards(AuthGuard)
  async getProject(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() request: any,
  ) {
    return this.projectService.getProject(
      workspaceId,
      projectId,
      request.user.userId,
    );
  }

  // Used to update a specific project in a workspace. The user must be a member of the workspace.  
  @Patch(':projectId')
  @UseGuards(AuthGuard)
  async updateProject(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() request: any,
    @Body('name') name?: string,
    @Body('priority')
    priority?:
      | 'NO_PRIORITY'
      | 'URGENT'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW',
    @Body('leadId') leadId?: string,
    @Body('dueDate') dueDate?: string,
  ) {
    return this.projectService.updateProject(
      workspaceId,
      projectId,
      request.user.userId,
      name,
      priority,
      leadId,
      dueDate ? new Date(dueDate) : undefined,
    );
  }

  // Used to delete a specific project in a workspace. The user must be a member of the workspace.
  @Delete(':projectId')
  @UseGuards(AuthGuard)
  async deleteProject(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() request: any,
  ) {
    return this.projectService.deleteProject(
      workspaceId,
      projectId,
      request.user.userId,
    );
  }
}