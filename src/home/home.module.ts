import { CharacterModule } from '@/character/character.module';
import { RandomService } from '@/common/random.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { S3Module } from '@/s3/s3.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [PrismaModule, S3Module, UserModule, CharacterModule],
  controllers: [HomeController],
  providers: [HomeService, RandomService.withPool()],
})
export class HomeModule {}
