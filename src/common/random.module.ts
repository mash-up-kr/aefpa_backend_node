import { RandomService } from '@/common/random.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [RandomService.withPool()],
  exports: [RandomService],
})
export class RandomModule {}
