import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateDetailLogDto extends OmitType(DetailLogDto, [
  'id',
  'createdAt',
  'updatedAt',
  'cursor',
]) {}
