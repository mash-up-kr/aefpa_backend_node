import { Module } from '@nestjs/common';
import { LogService } from '@/log/log.service';
import { LogController } from '@/log/log.controller';
import { ImageModule } from '@/image/image.module';

@Module({
  imports: [ImageModule],
  providers: [LogService],
  controllers: [LogController],
})
export class LogModule {}
