import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { OmitType } from '@nestjs/swagger';

export class CreateDetailLogDto extends OmitType(DetailLogDto, [
  'id',
  'createdAt',
  'updatedAt',
  'cursor',
]) {}
