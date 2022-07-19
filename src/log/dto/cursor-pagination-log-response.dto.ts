import { CursorPaginationResponseDto } from '@/common/dto/pagination-response.dto';
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
    cursorPaginationRespontDto: CursorPaginationResponseDto,
  ) {
    const { pageSize, totalCount, endCursor, hasNextPage } = cursorPaginationRespontDto;

    return customPlainToInstance(CursorPaginationLogResponseDto, {
      logs: logs.map((log) => LogDto.fromLogIncludeImages(log, 'createdAt')),
      pageInfo: CursorPaginationResponseDto.toDto(pageSize, totalCount, endCursor, hasNextPage),
    });
  }
}
