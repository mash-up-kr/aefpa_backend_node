import { LogDto } from '@/log/dto/log.dto';
import { OmitType } from '@nestjs/swagger';

export class LogResponseDto extends OmitType(LogDto, ['cursor']) {}
