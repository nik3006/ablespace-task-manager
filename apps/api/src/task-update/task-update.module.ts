import { Module } from '@nestjs/common';

import { TaskUpdateController } from './task-update.controller';
import { TaskUpdateService } from './task-update.service';

import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [TaskUpdateController],
  providers: [TaskUpdateService],
})
export class TaskUpdateModule {}