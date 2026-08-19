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

import { LabelService } from './label.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('workspaces/:workspaceId/labels')
export class LabelController {
  constructor(
    private readonly labelService: LabelService,
  ) {}

  // Create a label
  @Post()
  @UseGuards(AuthGuard)
  async createLabel(
    @Param('workspaceId') workspaceId: string,
    @Body('name') name: string,
    @Body('color') color: string,
    @Req() request: any,
  ) {
    return this.labelService.createLabel(
      workspaceId,
      request.user.userId,
      name,
      color,
    );
  }

  // Get all labels in a workspace
  @Get()
  @UseGuards(AuthGuard)
  async getWorkspaceLabels(
    @Param('workspaceId') workspaceId: string,
    @Req() request: any,
  ) {
    return this.labelService.getWorkspaceLabels(
      workspaceId,
      request.user.userId,
    );
  }

  // Get one label
  @Get(':labelId')
  @UseGuards(AuthGuard)
  async getLabel(
    @Param('workspaceId') workspaceId: string,
    @Param('labelId') labelId: string,
    @Req() request: any,
  ) {
    return this.labelService.getLabel(
      workspaceId,
      labelId,
      request.user.userId,
    );
  }

  // Update a label
  @Patch(':labelId')
  @UseGuards(AuthGuard)
  async updateLabel(
    @Param('workspaceId') workspaceId: string,
    @Param('labelId') labelId: string,
    @Req() request: any,
    @Body('name') name?: string,
    @Body('color') color?: string,
  ) {
    return this.labelService.updateLabel(
      workspaceId,
      labelId,
      request.user.userId,
      name,
      color,
    );
  }

  // Delete a label
  @Delete(':labelId')
  @UseGuards(AuthGuard)
  async deleteLabel(
    @Param('workspaceId') workspaceId: string,
    @Param('labelId') labelId: string,
    @Req() request: any,
  ) {
    return this.labelService.deleteLabel(
      workspaceId,
      labelId,
      request.user.userId,
    );
  }
}