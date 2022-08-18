import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { OmitType } from '@nestjs/swagger';

export class DetailLogResponseDto extends OmitType(DetailLogDto, ['cursor']) {}
