import { CharacterModule } from '@/character/character.module';
import { DetailLogModule } from '@/detail-log/detail-log.module';
import { LogModule } from '@/log/log.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule, CharacterModule, LogModule, DetailLogModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
