import { LogWithImages } from '@/log/log.types';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import * as moment from 'moment';

export class LogDto {
  @IsNumber()
  id: number;

  @IsString({ each: true })
  @MinLength(1)
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
