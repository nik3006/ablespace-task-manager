import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { GoogleStrategy } from './google.strategy';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => WorkspaceModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, GoogleStrategy],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}