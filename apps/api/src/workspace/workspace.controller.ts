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
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from '../auth/auth.guard';

// This controller handles all HTTP requests related to workspaces. It ensures that users have the necessary permissions to perform actions on workspaces and delegates the actual business logic to the WorkspaceService.
// This controller uses the service available in workspace.service.ts to perform the actual business logic. It ensures that users have the necessary permissions to perform actions on workspaces.
@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
  ) {}

  // Used to create a new workspace. The user creating the workspace will be the owner of the workspace.
  @Post()
  @UseGuards(AuthGuard)
  async createWorkspace(
    @Body('name') name: string,
    @Req() request: any,
  ) {
    return this.workspaceService.createWorkspace(
      name,
      request.user.userId,
    );
  }

  // Used to get all workspaces that the user is a member of.
  @Get()
  @UseGuards(AuthGuard)
  async getWorkspaces(@Req() request: any) {
    return this.workspaceService.getUserWorkspaces(
      request.user.userId,
    );
  }

  @Get('guest/available')
  async getGuestAvailableWorkspaces() {
    return this.workspaceService.getGuestAvailableWorkspaces();
  }

  // Used to get a specific workspace. The user must be a member of the workspace.
  @Get(':id')
  @UseGuards(AuthGuard)
  async getWorkspace(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.workspaceService.getWorkspace(
      id,
      request.user.userId,
    );
  }

  // Used to update a specific workspace. The user must be the owner of the workspace.
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateWorkspace(
    @Param('id') id: string,
    @Body('name') name: string,
    @Req() request: any,
  ) {
    return this.workspaceService.updateWorkspace(
      id,
      request.user.userId,
      name,
    );
  }

  // Used to delete a specific workspace. The user must be the owner of the workspace.
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteWorkspace(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.workspaceService.deleteWorkspace(
      id,
      request.user.userId,
    );
  }

  // Used to get all members of a specific workspace. The user must be a member of the workspace.
  @Get(':id/members')
  @UseGuards(AuthGuard)
  async getWorkspaceMembers(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.workspaceService.getWorkspaceMembers(
      id,
      request.user.userId,
    );
  }

  // Used to add a member to a specific workspace. The user must be the owner of the workspace.
  @Post(':id/members')
  @UseGuards(AuthGuard)
  async addWorkspaceMember(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Req() request: any,
  ) {
    return this.workspaceService.addWorkspaceMember(
      id,
      request.user.userId,
      userId,
    );
  }

  // Used to update the role of a member in a specific workspace. The user must be the owner of the workspace.
  @Patch(':id/members/:memberId')
  @UseGuards(AuthGuard)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body('role') role: 'OWNER' | 'MEMBER' | 'GUEST',
    @Req() request: any,
  ) {
    return this.workspaceService.updateMemberRole(
      id,
      request.user.userId,
      memberId,
      role,
    );
  }

  // Used to remove a member from a specific workspace. The user must be the owner of the workspace.
  @Delete(':id/members/:memberId')
  @UseGuards(AuthGuard)
  async removeWorkspaceMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() request: any,
  ) {
    return this.workspaceService.removeWorkspaceMember(
      id,
      request.user.userId,
      memberId,
    );
  }

  // Used when the currently logged-in user wants to leave a workspace.
  @Delete(':id/leave')
  @UseGuards(AuthGuard)
  async leaveWorkspace(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.workspaceService.leaveWorkspace(
      id,
      request.user.userId,
    );
  }
}