import { IsNumber, IsOptional } from 'class-validator';

class PaginationRequestDto {
  @IsNumber()
  @IsOptional()
  pageSize?: number;
}

export class CursorPaginationRequestDto extends PaginationRequestDto {
  @IsOptional()
  endCursor?: string;
}

export class OffsetPaginationRequestDto extends PaginationRequestDto {
  @IsNumber()
  page: number;
}
