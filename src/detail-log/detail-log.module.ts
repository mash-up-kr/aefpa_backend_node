import { Module } from '@nestjs/common';
import { DetailLogService } from './detail-log.service';
import { DetailLogController } from './detail-log.controller';
import { ImageModule } from '@/image/image.module';
import { S3Module } from '@/s3/s3.module';

@Module({
  imports: [ImageModule, S3Module],
  providers: [DetailLogService],
  controllers: [DetailLogController],
  exports: [DetailLogService],
})
export class DetailLogModule {}
