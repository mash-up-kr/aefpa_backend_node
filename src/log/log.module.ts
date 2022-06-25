import { Module } from '@nestjs/common';
import { LogService } from 'src/log/log.service';

@Module({
  providers: [LogService],
})
export class LogModule {}
