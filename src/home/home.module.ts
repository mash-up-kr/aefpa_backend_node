import { RandomCharacterService } from '@/character/random.character.service';
import { RandomService } from '@/common/random.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [PrismaModule],
  controllers: [HomeController],
  providers: [HomeService, RandomCharacterService, RandomService.withPool()],
})
export class HomeModule {}
