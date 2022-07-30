import { CursorPaginationResponseDto } from '@/common/dto/response/pagination-response.dto';
import { LogDto } from '@/log/dto/log.dto';
import { LogWithImages } from '@/log/log.types';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { IsArray, IsNotEmptyObject } from 'class-validator';

export class CursorPaginationLogResponseDto {
  @IsArray()
  logs: LogDto[];

  @IsNotEmptyObject()
  pageInfo: CursorPaginationResponseDto;

  static fromLogIncludeImages(
    logs: LogWithImages[],
    cursorPaginationResponseDto: CursorPaginationResponseDto,
  ) {
    const { pageSize, totalCount, endCursor, hasNextPage } = cursorPaginationResponseDto;

    return customPlainToInstance(CursorPaginationLogResponseDto, {
      logs: logs.map((log) => LogDto.fromLogIncludeImages(log, 'id')),
      pageInfo: CursorPaginationResponseDto.toDto(pageSize, totalCount, endCursor, hasNextPage),
    });
  }
}
