import { ImageModule } from '@/image/image.module';
import { LogStatsService } from '@/log/log-stats.service';
import { LogController } from '@/log/log.controller';
import { LogService } from '@/log/log.service';
import { S3Module } from '@/s3/s3.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ImageModule, S3Module],
  providers: [LogService, LogStatsService],
  controllers: [LogController],
  exports: [LogService, LogStatsService],
})
export class LogModule {}
