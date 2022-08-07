import { CharacterModule } from '@/character/character.module';
import { LogModule } from '@/log/log.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule, CharacterModule, LogModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
