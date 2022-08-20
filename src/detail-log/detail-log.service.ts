import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import { CreateDetailLogDto } from '@/detail-log/dtos/request/create-detail-log.dto';
import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CursorPaginationDetailLogResponseDto } from '@/detail-log/dtos/response/cursor-pagination-detail-log-response.dto';
import { decodeCursor, encodeCursor } from '@/util/cursor-paginate';
import { checkExists, checkNotExists } from '@/common/error-util';
import { DetailLogWithImageRecipes } from '@/detail-log/types/detail-log.type';
import { ImageService } from '@/image/image.service';
import { S3Service } from '@/s3/s3.service';
import { RecipeDto } from '@/detail-log/dtos/recipe.dto';
import { UpdateDetailLogDto } from '@/detail-log/dtos/request/update-detail-log.dto';

@Injectable()
export class DetailLogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createDetailLogDto: CreateDetailLogDto,
    brandImage: Express.Multer.File,
    recipeImages: Express.Multer.File[],
    user: UserWithoutPassword,
  ): Promise<DetailLogDto> {
    const { title, description, ingredients, recipes } = createDetailLogDto;

    const uploadedBrandImage = await this.s3Service.upload([brandImage], 'recipe');
    const uploadedRecipeImages = await this.s3Service.upload(recipeImages, 'recipe');

    if (uploadedRecipeImages.length !== recipes.length) {
      throw new InternalServerErrorException(
        '요청한 레시피 수와 업로드된 레시피 이미지 수가 다릅니다.',
      );
    }

    const createdRecipes: RecipeDto[] = [];

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const uploadedRecipeImage = uploadedRecipeImages[i];

      const createdRecipe: RecipeDto = {
        description: recipe,
        image: {
          original: uploadedRecipeImage.original,
          w256: uploadedRecipeImage.w256,
          w1024: uploadedRecipeImage.w1024,
        },
      };

      createdRecipes.push(createdRecipe);
    }

    const detailLog = await this.prismaService.detailLog.create({
      include: {
        image: true,
        recipes: {
          include: {
            image: true,
          },
        },
        scrapUsers: true,
        goodUsers: true,
      },
      data: {
        title,
        description,
        ingredients: ingredients.join(','),
        user: {
          connect: {
            id: user.id,
          },
        },
        image: {
          create: {
            original: uploadedBrandImage[0].original,
            w_256: uploadedBrandImage[0].w256,
            w_1024: uploadedBrandImage[0].w1024,
          },
        },
        recipes: {
          create: createdRecipes.map((recipe) => {
            return {
              description: recipe.description,
              image: {
                create: {
                  original: recipe.image.original,
                  w_256: recipe.image.w256,
                  w_1024: recipe.image.w1024,
                },
              },
            };
          }),
        },
      },
    });

    return DetailLogDto.fromDetailLogIncludesImageRecipes(detailLog, user.id);
  }

  async findAll(
    cursorPaginationRequestDto: CursorPaginationRequestDto,
    user: UserWithoutPassword,
  ): Promise<DetailLogDto[] | CursorPaginationDetailLogResponseDto> {
    const { pageSize, endCursor } = cursorPaginationRequestDto;

    //find all without cursor pagination
    if (!pageSize) {
      const foundDetailLogs = await this.prismaService.detailLog.findMany({
        include: {
          image: true,
          recipes: {
            include: {
              image: true,
            },
          },
          scrapUsers: true,
          goodUsers: true,
        },
        where: {
          userId: user.id,
        },
        orderBy: {
          id: 'desc',
        },
      });

      return foundDetailLogs.map((foundDetailLog) =>
        DetailLogDto.fromDetailLogIncludesImageRecipes(foundDetailLog, user.id),
      );
    }

    return await this.findAllByCursorPagination(user, pageSize, endCursor);
  }

  async findById(id: number, user: UserWithoutPassword): Promise<DetailLogDto> {
    const foundDetailLog = await this.prismaService.detailLog.findUnique({
      include: {
        image: true,
        recipes: {
          include: {
            image: true,
          },
        },
        scrapUsers: true,
        goodUsers: true,
      },
      where: {
        id,
      },
    });

    const checkedDetailLog = checkExists(foundDetailLog, 'detail log');

    return DetailLogDto.fromDetailLogIncludesImageRecipes(checkedDetailLog, user.id);
  }

  async update(
    detailLogId: number,
    updateDetailLogDto: UpdateDetailLogDto,
    brandImage: Express.Multer.File,
    recipeImages: Express.Multer.File[],
    user: UserWithoutPassword,
  ) {
    const { title, description, ingredients: ingredient, recipes } = updateDetailLogDto;

    const checkedDetailLog = await this.checkAuthentication(user, detailLogId);

    const uploadedBrandImage = await this.s3Service.upload([brandImage], 'recipe');
    const uploadedRecipeImages = await this.s3Service.upload(recipeImages, 'recipe');

    if (uploadedRecipeImages.length !== recipes.length) {
      throw new InternalServerErrorException(
        '요청한 레시피 수와 업로드된 레시피 이미지 수가 다릅니다.',
      );
    }

    const createdRecipes: RecipeDto[] = [];

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const uploadedRecipeImage = uploadedRecipeImages[i];

      const createdRecipe: RecipeDto = {
        description: recipe,
        image: {
          original: uploadedRecipeImage.original,
          w256: uploadedRecipeImage.w256,
          w1024: uploadedRecipeImage.w1024,
        },
      };

      createdRecipes.push(createdRecipe);
    }

    // transaction start
    const updatedDetailLog = await this.prismaService.$transaction(async () => {
      // create brandImage
      await this.prismaService.image.create({
        data: {
          original: uploadedBrandImage[0].original,
          w_256: uploadedBrandImage[0].w256,
          w_1024: uploadedBrandImage[0].w1024,
          detailLog: {
            connect: {
              id: detailLogId,
            },
          },
        },
      });

      // delete brandImage
      await this.imageService.delete(checkedDetailLog.image.id);

      // delete recipes
      await Promise.all(
        checkedDetailLog.recipes.map((recipe) =>
          this.prismaService.recipe.delete({
            where: {
              id: recipe.id,
            },
          }),
        ),
      );

      // delete recipe images
      await Promise.all(
        checkedDetailLog.recipes.map((recipe) => this.imageService.delete(recipe.image.id)),
      );

      // create recipe and recipe images
      await Promise.all(
        createdRecipes.map((createdRecipe) =>
          this.prismaService.recipe.create({
            data: {
              description: createdRecipe.description,
              image: {
                create: {
                  original: createdRecipe.image.original,
                  w_256: createdRecipe.image.w256,
                  w_1024: createdRecipe.image.w1024,
                },
              },
              DetailLog: {
                connect: {
                  id: detailLogId,
                },
              },
            },
          }),
        ),
      );

      // update detail log
      return await this.prismaService.detailLog.update({
        include: {
          image: true,
          recipes: {
            include: {
              image: true,
            },
          },
          scrapUsers: true,
          goodUsers: true,
        },
        where: {
          id: detailLogId,
        },
        data: {
          title,
          description,
          ingredients: ingredient.join(','),
        },
      });
    });

    return DetailLogDto.fromDetailLogIncludesImageRecipes(updatedDetailLog, user.id);
  }

  async delete(id: number, user: UserWithoutPassword) {
    const checkedDetailLog = await this.checkAuthentication(user, id);

    await this.prismaService.$transaction(async () => {
      await this.prismaService.detailLog.delete({
        where: {
          id: checkedDetailLog.id,
        },
      });

      //대문 이미지 삭제
      await this.imageService.delete(checkedDetailLog.image.id);

      //레시피들 삭제
      await Promise.all(
        checkedDetailLog.recipes.map((recipe) =>
          this.prismaService.recipe.delete({
            where: {
              id: recipe.id,
            },
          }),
        ),
      );

      //레시피의 이미지들 삭제
      await Promise.all(
        checkedDetailLog.recipes.map((recipe) =>
          this.prismaService.image.delete({
            where: {
              id: recipe.image.id,
            },
          }),
        ),
      );
    });
  }

  async like(detailLogId: number, user: UserWithoutPassword, type: 'like' | 'unlike') {
    const foundDetailLog = await this.findById(detailLogId, user);

    const foundUserGoodLog = await this.prismaService.userGoodLog.findFirst({
      where: {
        userId: user.id,
        detailLogId: detailLogId,
      },
    });

    // if like
    if (type === 'like') {
      // if already exists throw exception
      try {
        checkNotExists(foundUserGoodLog, 'log');
      } catch (err) {
        throw new BadRequestException('already LIKE');
      }

      const userGoodLogs = await this.prismaService.userGoodLog.create({
        include: {
          detailLog: {
            include: {
              image: true,
              recipes: {
                include: {
                  image: true,
                },
              },
              scrapUsers: true,
              goodUsers: true,
            },
          },
        },
        data: {
          userId: user.id,
          detailLogId: foundDetailLog.id,
        },
      });

      return DetailLogDto.fromDetailLogIncludesImageRecipes(
        userGoodLogs.detailLog as DetailLogWithImageRecipes,
        user.id,
      );
    }
    // if unlike
    else {
      // if not exists throw exception
      try {
      } catch (err) {
        throw new BadRequestException('already UNLIKE');
      }

      await this.prismaService.userGoodLog.deleteMany({
        where: {
          userId: user.id,
          detailLogId: detailLogId,
        },
      });

      // delete한건 한번더 조회해야한다.
      const detailLog = await this.prismaService.detailLog.findUnique({
        include: {
          image: true,
          recipes: {
            include: {
              image: true,
            },
          },
          scrapUsers: true,
          goodUsers: true,
        },
        where: {
          id: detailLogId,
        },
      });

      return DetailLogDto.fromDetailLogIncludesImageRecipes(
        detailLog as DetailLogWithImageRecipes,
        user.id,
      );
    }
  }

  async scrap(detailLogId: number, user: UserWithoutPassword, type: 'scrap' | 'unscrap') {
    const foundDetailLog = await this.findById(detailLogId, user);

    const foundUserScrapLog = await this.prismaService.userScrapLog.findFirst({
      where: {
        userId: user.id,
        detailLogId: detailLogId,
      },
    });

    // scrap
    if (type === 'scrap') {
      // if already exists throw exception
      try {
        checkNotExists(foundUserScrapLog, 'detail log');
      } catch (err) {
        throw new BadRequestException('already SCRAPPED');
      }

      const userScrapLog = await this.prismaService.userScrapLog.create({
        include: {
          detailLog: {
            include: {
              image: true,
              recipes: {
                include: {
                  image: true,
                },
              },
              scrapUsers: true,
              goodUsers: true,
            },
          },
        },
        data: {
          userId: user.id,
          detailLogId: foundDetailLog.id,
        },
      });

      return DetailLogDto.fromDetailLogIncludesImageRecipes(
        userScrapLog.detailLog as DetailLogWithImageRecipes,
        user.id,
      );
    }
    // unscrap
    else {
      // if not exists throw exception
      try {
        checkExists(foundUserScrapLog, 'log');
      } catch (err) {
        throw new BadRequestException('already UNSCRAPPED');
      }

      await this.prismaService.userScrapLog.deleteMany({
        where: {
          userId: user.id,
          detailLogId: detailLogId,
        },
      });

      // delete한건 한번더 조회해야한다.
      const detailLog = await this.prismaService.detailLog.findUnique({
        include: {
          image: true,
          recipes: {
            include: {
              image: true,
            },
          },
          scrapUsers: true,
          goodUsers: true,
        },
        where: {
          id: detailLogId,
        },
      });

      return DetailLogDto.fromDetailLogIncludesImageRecipes(
        detailLog as DetailLogWithImageRecipes,
        user.id,
      );
    }
  }

  private async checkAuthentication(
    user: UserWithoutPassword,
    logId: number,
  ): Promise<DetailLogWithImageRecipes> {
    const foundDetailLog = await this.prismaService.detailLog.findUnique({
      include: {
        image: true,
        recipes: {
          include: {
            image: true,
          },
        },
        scrapUsers: true,
        goodUsers: true,
      },
      where: {
        id: logId,
      },
    });

    const checkedDetailLog = checkExists(foundDetailLog, 'detail log');

    if (user.id !== checkedDetailLog.userId) {
      throw new UnauthorizedException('해당 유저는 접근할 수 없는 리소스입니다.');
    }

    return checkedDetailLog;
  }

  private async findAllByCursorPagination(
    user: UserWithoutPassword,
    pageSize: number,
    endCursor?: string,
  ) {
    //first page
    if (!endCursor) {
      const foundDetailLogs = await this.prismaService.detailLog.findMany({
        take: pageSize + 1,
        include: {
          image: true,
          recipes: {
            include: {
              image: true,
            },
          },
          scrapUsers: true,
          goodUsers: true,
        },
        where: {
          userId: user.id,
        },
        orderBy: {
          id: 'desc',
        },
      });

      // get hasNextPage
      let hasNextPage = false;
      if (pageSize + 1 === foundDetailLogs.length) {
        hasNextPage = true;
        foundDetailLogs.pop();
      }
      //get has totalCount
      const totalCount = await this.prismaService.detailLog.count({
        where: {
          userId: user.id,
        },
      });

      //get endCursor
      const endCursor =
        foundDetailLogs.length > 0
          ? encodeCursor(foundDetailLogs[foundDetailLogs.length - 1].id)
          : null;

      return CursorPaginationDetailLogResponseDto.fromDetailLogIncludeImageRecipes(
        foundDetailLogs,
        user.id,
        {
          pageSize,
          hasNextPage,
          endCursor,
          totalCount,
        },
      );
    }

    // after second page..
    const decodedEndCursor = decodeCursor('number', endCursor) as number;

    const foundDetailLogs = await this.prismaService.detailLog.findMany({
      take: pageSize + 1,
      include: {
        image: true,
        recipes: {
          include: {
            image: true,
          },
        },
        scrapUsers: true,
        goodUsers: true,
      },
      where: {
        userId: user.id,
        id: {
          lt: decodedEndCursor,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    // get hasNextPage
    let hasNextPage = false;

    if (pageSize + 1 === foundDetailLogs.length) {
      hasNextPage = true;
      foundDetailLogs.pop();
    }

    //get has totalCount
    const totalCount = await this.prismaService.detailLog.count({
      where: {
        userId: user.id,
      },
    });

    //get endCursor
    const endCursorResult =
      foundDetailLogs.length > 0
        ? encodeCursor(foundDetailLogs[foundDetailLogs.length - 1].id)
        : null;

    return CursorPaginationDetailLogResponseDto.fromDetailLogIncludeImageRecipes(
      foundDetailLogs,
      user.id,
      {
        pageSize,
        hasNextPage,
        endCursor: endCursorResult,
        totalCount,
      },
    );
  }
}
