import { LogWithImages } from '@/log/log.types';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { ArrayMinSize, IsNumber, IsOptional, IsString, MaxLength } from '@/validation';
import * as moment from 'moment';

export class LogDto {
  @IsNumber()
  id: number;

  @IsString({ each: true })
  @ArrayMinSize(1)
  imageUrls: string[];

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsString()
  @MaxLength(20)
  title: string;

  @IsOptional()
  @MaxLength(300)
  description?: string | null;

  @IsOptional()
  @MaxLength(20)
  kick?: string | null;

  static fromLogIncludeImages(log: LogWithImages): LogDto {
    const { id, createdAt, updatedAt, title, description, kick, images } = log;

    return customPlainToInstance(LogDto, {
      id,
      imageUrls: images.map((image) => image.url),
      createdAt: moment(createdAt).format(),
      updatedAt: moment(updatedAt).format(),
      title,
      description,
      kick,
    });
  }
}
