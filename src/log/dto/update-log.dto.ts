import { LogDto } from '@/log/dto/log.dto';
import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLogDto extends OmitType(LogDto, ['id', 'createdAt', 'updatedAt']) {
  @IsOptional()
  @IsString({ each: true })
  imageUrls: string[];
}
