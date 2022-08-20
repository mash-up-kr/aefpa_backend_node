import { LogDto } from '@/log/dto/log.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UpdateLogDto extends OmitType(LogDto, [
  'id',
  'createdAt',
  'updatedAt',
  'cursor',
  'like',
  'isScrapped',
  'images',
]) {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    multipleOf: 1,
  })
  images: any;
}
