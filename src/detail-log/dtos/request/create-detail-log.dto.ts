import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateDetailLogDto extends OmitType(DetailLogDto, [
  'id',
  'createdAt',
  'updatedAt',
  'cursor',
  'image',
  'recipes',
  'like',
  'isScrapped',
]) {
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.split(',').map(String);
  })
  @ArrayMinSize(1)
  recipes: string[];

  @ApiProperty({
    type: 'file',
  })
  brandImage: any;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    multipleOf: 1,
  })
  recipeImages: any;
}
