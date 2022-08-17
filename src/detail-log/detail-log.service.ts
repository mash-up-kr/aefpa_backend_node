import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import { CreateDetailLogDto } from '@/detail-log/dtos/request/create-detail-log.dto';
import { DetailLogDto } from '@/detail-log/dtos/detail-log.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CursorPaginationDetailLogResponseDto } from '@/detail-log/dtos/response/cursor-pagination-detail-log-response.dto';
import { decodeCursor, encodeCursor } from '@/util/cursor-paginate';
import { checkExists } from '@/common/error-util';
import { DetailLogWithImageRecipes } from '@/detail-log/types/detail-log.type';
import { ImageService } from '@/image/image.service';
import { S3Service } from '@/s3/s3.service';

@Injectable()
export class DetailLogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createDetailLogDto: CreateDetailLogDto,
    user: UserWithoutPassword,
  ): Promise<DetailLogDto> {
    const { title, description, ingredient, recipes, image } = createDetailLogDto;

    const detailLog = await this.prismaService.detailLog.create({
      include: {
        image: true,
        recipes: {
          include: {
            image: true,
          },
        },
      },
      data: {
        title,
        description,
        ingredient: ingredient.join(','),
        user: {
          connect: {
            id: user.id,
          },
        },
        image: {
          create: {
            original: image.original,
            w_256: image.w256,
            w_1024: image.w1024,
          },
        },
        recipes: {
          create: recipes.map((recipe) => {
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
      },
      where: {
        id,
      },
    });

    const checkedDetailLog = checkExists(foundDetailLog, 'detail log');

    return DetailLogDto.fromDetailLogIncludesImageRecipes(checkedDetailLog, user.id);
  }

  //   async update(
  //     id: number,
  //     updateDetailLogDto: UpdateDetailLogDto,
  //     user: UserWithoutPassword,
  //   ): Promise<DetailLogDto> {
  //     const { title, description, image, ingredient, recipes } = updateDetailLogDto;

  //     const checkedAuthenticatedDetailLog = await this.checkAuthentication(user, id);

  //     // 해당로그에 이미 존재하는 대표 이미지
  //     const existImage = checkedAuthenticatedDetailLog.image;

  //     // 업데이트할 대표 이미지
  //     const updateImage = image;

  //     // 해당 로그에 이미 존재하는 레시피들
  //     const existRecipes = checkedAuthenticatedDetailLog.recipes;

  //     const newRecipes = recipes.filter((recipe) => !recipe.id);

  //     const deleteRecipes = existRecipes
  //       .map((_d) => _d.id)
  //       .filter((_d) => !recipes.map((_d) => _d.id).includes(_d));
  //     const updateRecipes = existRecipes
  //       .map((_d) => _d.id)
  //       .filter((_d) => recipes.map((_d) => _d.id).includes(_d));

  //     const updatedDetailLog = await this.prismaService.$transaction(async () => {
  //       if (existImage.original !== updateImage.original) {
  //         //삭제하고 추가
  //         this.imageService.delete(existImage.id);
  //         this.imageService.create(updateImage, checkedAuthenticatedDetailLog.id);
  //       }

  //       // 삭제할 레시피는 삭제
  //       await this.prismaService.recipe.deleteMany({
  //         where: {
  //           id: {
  //             in: deleteRecipes,
  //           },
  //         },
  //       });

  //       // 추가할 레시피는 추가
  //       await this.prismaService.recipe.createMany({
  //         data: newRecipes.map((newRecipe) => {
  //           return {
  //             detailLogId: id,
  //           };
  //         }),
  //       });

  //       const updateDetailLog = await this.prismaService.detailLog.update({
  //         include: {
  //           image: true,
  //           recipes: {
  //             include: {
  //               image: true,
  //             },
  //           },
  //         },
  //         where: {
  //           id,
  //         },
  //         data: {
  //           title,
  //           description,
  //           ingredient: ingredient.join(','),
  //           //   recipes
  //         },
  //       });

  //       return updateDetailLog;
  //     });

  //     return DetailLogDto.fromDetailLogIncludesImageRecipes(updatedDetailLog, user.id);
  //   }

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
