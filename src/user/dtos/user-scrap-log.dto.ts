import { UserScrapLog } from '@/api/server/generated';
import { UserScrapLogType } from '@/user/user.types';
import { encodeCursor } from '@/util/cursor-paginate';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEnum, IsNumber, IsString } from 'class-validator';

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

  @IsString()
  cursor: string;

  static fromUserScrapLog(
    scrapLog: UserScrapLogType,
    cursorColumn: keyof UserScrapLog,
  ): UserScrapLogDto {
    const findInfoFromScrapLog = (
      scrapLog: UserScrapLogType,
    ): { id: number; type: ScrapLogType; title: string } => {
      if (scrapLog.log && !scrapLog.detailLog) {
        return { id: scrapLog.log.id, type: ScrapLogType.SIMPLE, title: scrapLog.log.title };
      }

      if (!scrapLog.log && scrapLog.detailLog) {
        return {
          id: scrapLog.detailLog.id,
          type: ScrapLogType.DETAIL,
          title: scrapLog.detailLog.title,
        };
      }

      throw new InternalServerErrorException(`해당 스크랩이 간단 로그도, 상세 로그도 없습니다.`);
    };

    const { id, title, type } = findInfoFromScrapLog(scrapLog);

    return customPlainToInstance(UserScrapLogDto, {
      id,
      type,
      title,
      cursor: encodeCursor(scrapLog[cursorColumn] as Date),
    });
  }
}
