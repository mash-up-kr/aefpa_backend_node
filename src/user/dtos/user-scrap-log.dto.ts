import { UserScrapLog } from '@/api/server/generated';
import { ImageDto } from '@/image/dtos/image.dto';
import { UserScrapLogType } from '@/user/user.types';
import { encodeCursor } from '@/util/cursor-paginate';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { InternalServerErrorException } from '@nestjs/common';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export enum ScrapLogType {
  SIMPLE = 'simple',
  DETAIL = 'detail',
}

export class UserScrapLogDto {
  @IsNumber()
  id: number;

  @IsEnum(ScrapLogType)
  type: ScrapLogType;

  @IsString()
  title: string;

  @IsObject()
  image: ImageDto;

  @ApiHideProperty()
  @IsOptional()
  cursor?: string;

  static fromUserScrapLog(
    scrapLog: UserScrapLogType,
    cursorColumn?: keyof UserScrapLog,
  ): UserScrapLogDto {
    const findInfoFromScrapLog = (
      scrapLog: UserScrapLogType,
    ): { id: number; type: ScrapLogType; title: string; image: ImageDto } => {
      if (scrapLog.log && !scrapLog.detailLog) {
        if (scrapLog.log.images.length === 0) {
          throw new InternalServerErrorException('간딴 끼록에 이미지가 하나도 없습니다.');
        }

        const image: ImageDto = {
          original: scrapLog.log.images[0].original,
          w256: scrapLog.log.images[0].w_256,
          w1024: scrapLog.log.images[0].w_1024,
        };

        return { id: scrapLog.log.id, type: ScrapLogType.SIMPLE, title: scrapLog.log.title, image };
      }

      if (!scrapLog.log && scrapLog.detailLog) {
        if (!scrapLog.detailLog.image) {
          throw new InternalServerErrorException('상세 끼록에 대표 이미지가 없습니다.');
        }

        const image: ImageDto = {
          original: scrapLog.detailLog.image.original,
          w256: scrapLog.detailLog.image.w_256,
          w1024: scrapLog.detailLog.image.w_1024,
        };

        return {
          id: scrapLog.detailLog.id,
          type: ScrapLogType.DETAIL,
          title: scrapLog.detailLog.title,
          image,
        };
      }

      throw new InternalServerErrorException(`해당 스크랩이 간단 로그도, 상세 로그도 없습니다.`);
    };

    const { id, title, type, image } = findInfoFromScrapLog(scrapLog);

    if (cursorColumn) {
      return customPlainToInstance(UserScrapLogDto, {
        id,
        type,
        title,
        image,
        cursor: encodeCursor(scrapLog[cursorColumn] as Date),
      });
    }

    return customPlainToInstance(UserScrapLogDto, {
      id,
      type,
      title,
      image,
    });
  }
}
