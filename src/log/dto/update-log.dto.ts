import { LogDto } from '@/log/dto/log.dto';
import { IsOptional, IsString } from '@/validation';
import { OmitType } from '@nestjs/swagger';

export class UpdateLogDto extends OmitType(LogDto, ['id', 'createdAt', 'updatedAt']) {
  @IsOptional()
  @IsString({ each: true })
  imageUrls: string[];
}
