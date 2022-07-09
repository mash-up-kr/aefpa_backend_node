import { Log, Image } from '@/api/server/generated';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class LogDto {
  @IsNumber()
  id: number;

  @IsString({ each: true })
  @Transform(({ value }) => {
    if (value.length === 0) {
      throw new BadRequestException('imageUrl은 최소 한개는 있어야 합니다.');
    }

    return value;
  })
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

  static fromLogIncludeImages(
    log: Log & {
      images: Image[];
    },
  ): LogDto {
    const { id, createdAt, updatedAt, title, description, kick, images } = log;

    return customPlainToInstance(LogDto, {
      id,
      imageUrls: images.map((image) => image.url),
      createdAt: createdAt.getTime().toString(),
      updatedAt: updatedAt.getTime().toString(),
      title,
      description,
      kick,
    });
  }
}
