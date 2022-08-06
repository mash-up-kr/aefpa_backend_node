import { IsBoolean, IsNumber } from 'class-validator';

export class LikeDto {
  @IsBoolean()
  isLike: boolean;

  @IsNumber()
  count: number;
}
