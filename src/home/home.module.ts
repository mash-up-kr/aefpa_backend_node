import { RandomCharacterService } from '@/character/random.character.service';
import { RandomService } from '@/common/random.service';
import { CharacterService } from '@/home/character.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { S3Module } from '@/s3/s3.module';
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [HomeController],
  providers: [HomeService, CharacterService, RandomCharacterService, RandomService.withPool()],
})
export class HomeModule {}