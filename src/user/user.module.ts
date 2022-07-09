import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
