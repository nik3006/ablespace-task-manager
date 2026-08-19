import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { LabelService } from './label.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('workspaces/:workspaceId/tasks/:taskId/labels')
export class TaskLabelController {
  constructor(
    private readonly labelService: LabelService,
  ) {}

  @Post(':labelId')
  @UseGuards(AuthGuard)
  async attachLabelToTask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
    @Req() request: any,
  ) {
    return this.labelService.attachLabelToTask(
      workspaceId,
      taskId,
      labelId,
      request.user.userId,
    );
  }

  @Delete(':labelId')
  @UseGuards(AuthGuard)
  async removeLabelFromTask(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
    @Req() request: any,
  ) {
    return this.labelService.removeLabelFromTask(
      workspaceId,
      taskId,
      labelId,
      request.user.userId,
    );
  }
}