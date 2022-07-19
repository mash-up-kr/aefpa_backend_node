import { Log } from '@/api/server/generated';
import { LogWithImages } from '@/log/log.types';
import { encodeCursor } from '@/util/cursor-paginate';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { ArrayMinSize, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
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

  @IsOptional()
  cursor?: string;

  static fromLogIncludeImages(log: LogWithImages, cursorColumn?: keyof Log): LogDto {
    const { id, createdAt, updatedAt, title, description, kick, images } = log;

    if (cursorColumn) {
      return customPlainToInstance(LogDto, {
        id,
        imageUrls: images.map((image) => image.url),
        createdAt: moment(createdAt).format(),
        updatedAt: moment(updatedAt).format(),
        title,
        description,
        kick,
        cursor: encodeCursor(log[cursorColumn] as Date),
      });
    }

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
