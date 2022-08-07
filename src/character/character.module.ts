import { CharacterService } from '@/character/character.service';
import { RandomCharacterService } from '@/character/random.character.service';
import { RandomModule } from '@/common/random.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { S3Module } from '@/s3/s3.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, S3Module, RandomModule],
  providers: [CharacterService, RandomCharacterService],
  exports: [CharacterService, RandomCharacterService],
})
export class CharacterModule {}
