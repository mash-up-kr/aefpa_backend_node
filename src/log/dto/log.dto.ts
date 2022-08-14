import { Log } from '@/api/server/generated';
import { ImageDto } from '@/image/dtos/image.dto';
import { LikeDto } from '@/log/dto/log-good.dto';
import { LogWithImages } from '@/log/log.types';
import { encodeCursor } from '@/util/cursor-paginate';
import { customPlainToInstance } from '@/util/plain-to-instance';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from '@/validation';
import * as moment from 'moment';

export class LogDto {
  @IsNumber()
  id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  images: ImageDto[];

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

  @IsObject()
  like: LikeDto;

  @IsBoolean()
  isScrapped: boolean;

  static fromLogIncludeImages(
    log: LogWithImages,
    loginId: number,
    cursorColumn?: keyof Log,
  ): LogDto {
    const { id, createdAt, updatedAt, title, description, kick, images, goodUsers, scrapUsers } =
      log;

    const isLoginUserLike = goodUsers.some((goodUser) => goodUser.userId === loginId);

    const isLoginUserScrap = scrapUsers.some((scrapUser) => scrapUser.userId === loginId);

    if (cursorColumn) {
      return customPlainToInstance(LogDto, {
        id,
        images: images.map((image) =>
          customPlainToInstance(ImageDto, {
            original: image.original,
            w256: image.w_256,
            w1024: image.w_1024,
          }),
        ),
        createdAt: moment(createdAt).format(),
        updatedAt: moment(updatedAt).format(),
        title,
        description,
        kick,
        cursor: encodeCursor(log[cursorColumn] as number),
        like: customPlainToInstance(LikeDto, {
          count: goodUsers.length,
          isLike: isLoginUserLike,
        }),
        isScrapped: isLoginUserScrap,
      });
    }

    return customPlainToInstance(LogDto, {
      id,
      images: images.map((image) =>
        customPlainToInstance(ImageDto, {
          original: image.original,
          w256: image.w_256,
          w1024: image.w_1024,
        }),
      ),
      createdAt: moment(createdAt).format(),
      updatedAt: moment(updatedAt).format(),
      title,
      description,
      kick,
      like: customPlainToInstance(LikeDto, {
        count: goodUsers.length,
        isLike: isLoginUserLike,
      }),
      isScrapped: isLoginUserScrap,
    });
  }
}
