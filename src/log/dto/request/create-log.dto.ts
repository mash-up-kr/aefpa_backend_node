import { LogDto } from '@/log/dto/log.dto';
import { OmitType } from '@nestjs/swagger';

export class CreateLogDto extends OmitType(LogDto, ['id', 'createdAt', 'updatedAt', 'cursor']) {}
