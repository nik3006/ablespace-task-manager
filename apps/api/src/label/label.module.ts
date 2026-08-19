import { Module } from '@nestjs/common';

import { LabelController } from './label.controller';
import { TaskLabelController } from './task-label.controller';
import { LabelService } from './label.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [
    LabelController,
    TaskLabelController,
  ],
  providers: [LabelService],
})
export class LabelModule {}