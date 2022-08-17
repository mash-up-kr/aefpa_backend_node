import { CursorPaginationResponseDto } from '@/common/dto/response/pagination-response.dto';
import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { DetailLogWithImageRecipes } from '@/detail-log/types/detail-log.type';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { IsArray, IsNotEmptyObject } from 'class-validator';

export class CursorPaginationDetailLogResponseDto {
  @IsArray()
  detailLogs: DetailLogDto[];

  @IsNotEmptyObject()
  pageInfo: CursorPaginationResponseDto;

  static fromDetailLogIncludeImageRecipes(
    detailLogs: DetailLogWithImageRecipes[],
    loginId: number,
    cursorPaginationResponseDto: CursorPaginationResponseDto,
  ): CursorPaginationDetailLogResponseDto {
    const { pageSize, totalCount, endCursor, hasNextPage } = cursorPaginationResponseDto;

    return customPlainToInstance(CursorPaginationDetailLogResponseDto, {
      detailLogs: detailLogs.map((detailLog) =>
        DetailLogDto.fromDetailLogIncludesImageRecipes(detailLog, loginId, 'id'),
      ),
      pageInfo: CursorPaginationResponseDto.toDto(pageSize, totalCount, endCursor, hasNextPage),
    });
  }
}
