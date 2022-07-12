import { Module } from '@nestjs/common';
import { LogService } from '@/log/log.service';
import { LogController } from '@/log/log.controller';
import { ImageModule } from '@/image/image.module';
import { S3Module } from '@/s3/s3.module';

@Module({
  imports: [ImageModule, S3Module],
  providers: [LogService],
  controllers: [LogController],
})
export class LogModule {}
