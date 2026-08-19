import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { SubtaskModule } from './subtask/subtask.module';
import { LabelModule } from './label/label.module';
import { TaskUpdateModule } from './task-update/task-update.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    WorkspaceModule,
    ProjectModule,
    TaskModule,
    SubtaskModule,
    LabelModule,
    TaskUpdateModule,

    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}