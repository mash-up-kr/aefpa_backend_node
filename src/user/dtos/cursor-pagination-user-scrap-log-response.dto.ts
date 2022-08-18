import { CursorPaginationResponseDto } from '@/common/dto/response/pagination-response.dto';
import { UserScrapLogDto } from '@/user/dtos/user-scrap-log.dto';
import { UserScrapLogType } from '@/user/user.types';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { IsArray, IsNotEmptyObject } from 'class-validator';

export class CursorPaginationUserScrapLogResponseDto {
  @IsArray()
  data: UserScrapLogDto[];

  @IsNotEmptyObject()
  pageInfo: CursorPaginationResponseDto;

  static fromUserScrapLog(
    scrapLogs: UserScrapLogType[],
    cursorPaginationResponseDto: CursorPaginationResponseDto,
  ): CursorPaginationUserScrapLogResponseDto {
    const { pageSize, totalCount, endCursor, hasNextPage } = cursorPaginationResponseDto;

    return customPlainToInstance(CursorPaginationUserScrapLogResponseDto, {
      data: scrapLogs.map((scrapLog) => UserScrapLogDto.fromUserScrapLog(scrapLog, 'createdAt')),
      pageInfo: CursorPaginationResponseDto.toDto(pageSize, totalCount, endCursor, hasNextPage),
    });
  }
}
