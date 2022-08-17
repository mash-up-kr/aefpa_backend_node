import { DetailLog } from '@/api/server/generated';
import { RecipeDto } from '@/detail-log/dtos/recipe.dto';
import { DetailLogWithImageRecipes } from '@/detail-log/types/detail-log.type';
import { ImageDto } from '@/image/dtos/image.dto';
import { LikeDto } from '@/log/dto/log-good.dto';
import { encodeCursor } from '@/util/cursor-paginate';
import { customPlainToInstance } from '@/util/plain-to-instance';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import * as moment from 'moment';

export class DetailLogDto {
  @IsNumber()
  id: number;

  @IsObject()
  image: ImageDto;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  // @ValidateNested({ each: true })
  @ArrayMinSize(1)
  ingredient: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  recipes: RecipeDto[];

  @IsOptional()
  cursor?: string;

  @IsObject()
  like: LikeDto;

  @IsBoolean()
  isScrapped: boolean;

  static fromDetailLogIncludesImageRecipes(
    detailLog: DetailLogWithImageRecipes,
    loginId: number,
    cursorColumn?: keyof DetailLog,
  ): DetailLogDto {
    const {
      id,
      title,
      description,
      image,
      ingredient,
      createdAt,
      updatedAt,
      recipes,
      goodUsers,
      scrapUsers,
    } = detailLog;

    const isLoginUserLike = goodUsers.some((goodUser) => goodUser.userId === loginId);

    const isLoginUserScrap = scrapUsers.some((scrapUser) => scrapUser.userId === loginId);

    if (cursorColumn) {
      return customPlainToInstance(DetailLogDto, {
        id,
        createdAt: moment(createdAt).format(),
        updatedAt: moment(updatedAt).format(),
        title,
        description,
        ingredient: ingredient.split(','),
        image: customPlainToInstance(ImageDto, {
          original: image.original,
          w256: image.w_256,
          w1024: image.w_1024,
        }),
        recipes: recipes.map((recipe) =>
          customPlainToInstance(RecipeDto, {
            description: recipe.description,
            image: customPlainToInstance(ImageDto, {
              original: recipe.image.original,
              w256: recipe.image.w_256,
              w1024: recipe.image.w_1024,
            }),
          }),
        ),
        cursor: encodeCursor(detailLog[cursorColumn] as number),
        like: customPlainToInstance(LikeDto, {
          count: goodUsers.length,
          isLike: isLoginUserLike,
        }),
        isScrapped: isLoginUserScrap,
      });
    }

    return customPlainToInstance(DetailLogDto, {
      id,
      createdAt: moment(createdAt).format(),
      updatedAt: moment(updatedAt).format(),
      title,
      description,
      ingredient: ingredient.split(','),
      image: customPlainToInstance(ImageDto, {
        original: image.original,
        w256: image.w_256,
        w1024: image.w_1024,
      }),
      recipes: recipes.map((recipe) =>
        customPlainToInstance(RecipeDto, {
          description: recipe.description,
          image: customPlainToInstance(ImageDto, {
            original: recipe.image.original,
            w256: recipe.image.w_256,
            w1024: recipe.image.w_1024,
          }),
        }),
      ),
      like: customPlainToInstance(LikeDto, {
        count: goodUsers.length,
        isLike: isLoginUserLike,
      }),
      isScrapped: isLoginUserScrap,
    });
  }
}
