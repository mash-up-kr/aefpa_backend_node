import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { LogModule } from '@/log/log.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule, LogModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
