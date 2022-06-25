import { Module } from '@nestjs/common';
import { LogService } from '@/log/log.service';

@Module({
  providers: [LogService],
})
export class LogModule {}
