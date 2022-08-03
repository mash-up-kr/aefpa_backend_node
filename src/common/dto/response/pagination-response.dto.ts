import { customPlainToInstance } from '@/util/plain-to-instance';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

class PaginationResponseDto {
  @IsNumber()
  pageSize: number;

  @IsNumber()
  totalCount: number;
}

export class CursorPaginationResponseDto extends PaginationResponseDto {
  @IsOptional()
  endCursor: string | null;

  @IsBoolean()
  hasNextPage: boolean;

  static toDto(
    pageSize: number,
    totalCount: number,
    endCursor: string | null,
    hasNextPage: boolean,
  ) {
    return customPlainToInstance(CursorPaginationResponseDto, {
      pageSize,
      endCursor,
      hasNextPage,
      totalCount,
    });
  }
}

export class OffsetPaginationResponseDto extends PaginationResponseDto {
  @IsNumber()
  page: number;
}
