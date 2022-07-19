import { checkExists } from '@/common/error-util';
import { ImageService } from '@/image/image.service';
import { CreateLogDto } from '@/log/dto/create-log.dto';
import { LogDto } from '@/log/dto/log.dto';
import { UpdateLogDto } from '@/log/dto/update-log.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { LogWithImages } from '@/log/log.types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CursorPaginationRequestDto } from '@/common/dto/pagination-request.dto';
import { CursorPaginationLogResponseDto } from '@/log/dto/cursor-pagination-log-response.dto';
import { decodeCursor, encodeCursor } from '@/util/cursor-paginate';
import { Prisma } from '@/api/server/generated';

@Injectable()
export class LogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  async create(createLogDto: CreateLogDto, user: UserWithoutPassword): Promise<LogDto> {
    const { title, description, kick, imageUrls } = createLogDto;

    const log = await this.prismaService.log.create({
      include: { images: true },
      data: {
        title,
        description,
        kick,
        user: {
          connect: {
            id: user.id,
          },
        },
        images: {
          create: imageUrls.map((imageUrl) => {
            return {
              url: imageUrl,
            };
          }),
        },
      },
    });

    return LogDto.fromLogIncludeImages(log);
  }

  async findAll(
    cursorPaginationRequestDto: CursorPaginationRequestDto,
    user: UserWithoutPassword,
  ): Promise<LogDto[] | CursorPaginationLogResponseDto> {
    const { pageSize, endCursor } = cursorPaginationRequestDto;

    // find all withdout cursor pagination
    if (!pageSize) {
      const foundLogs = await this.prismaService.log.findMany({
        include: {
          images: true,
        },
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return foundLogs.map((foundLog) => LogDto.fromLogIncludeImages(foundLog));
    }

    return await this.findAllByCursorPagination(user, pageSize, endCursor);
  }

  async findById(id: number): Promise<LogDto> {
    const foundLog = await this.prismaService.log.findUnique({
      include: {
        images: true,
        user: true,
      },
      where: {
        id,
      },
    });

    const checkedLog = checkExists(foundLog);

    return LogDto.fromLogIncludeImages(checkedLog);
  }

  async update(id: number, updateLogDto: UpdateLogDto, user: UserWithoutPassword): Promise<LogDto> {
    const { title, description, kick, imageUrls } = updateLogDto;

    const checkedLog = await this.checkAuthentication(user, id);

    //TODO:트랜잭션 start
    const existImages = checkedLog.images;
    const existImageUrls = existImages.map((image) => image.url);

    const deleteImages = existImages.filter((existUrl) => !imageUrls.includes(existUrl.url));
    const insertUrls = imageUrls.filter((imageUrl) => !existImageUrls.includes(imageUrl));

    // 삭제할 이미지는 삭제
    await Promise.all(deleteImages.map((image) => this.imageService.delete(image.id)));
    // 추가할 이미지는 추가
    await Promise.all(insertUrls.map((url) => this.imageService.create(url, checkedLog.id)));

    const updateLog = await this.prismaService.log.update({
      include: {
        images: true,
      },
      where: {
        id,
      },
      data: {
        title,
        description,
        kick,
      },
    });
    //TODO:트랜잭션 end

    return LogDto.fromLogIncludeImages(updateLog);
  }

  async delete(id: number, user: UserWithoutPassword): Promise<boolean> {
    const checkedLog = await this.checkAuthentication(user, id);

    //TODO: 트랜잭션 start
    await this.prismaService.log.delete({
      where: {
        id: checkedLog.id,
      },
    });

    await Promise.all(checkedLog.images.map((image) => this.imageService.delete(image.id)));
    //TODO: 트랜잭션 end

    return true;
  }

  private async checkAuthentication(
    user: UserWithoutPassword,
    logId: number,
  ): Promise<LogWithImages> {
    const foundLog = await this.prismaService.log.findUnique({
      include: {
        images: true,
      },
      where: {
        id: logId,
      },
    });

    const checkedLog = checkExists(foundLog);

    if (user.id !== checkedLog.userId) {
      throw new UnauthorizedException('해당 유저는 접근할 수 없는 리소스입니다.');
    }

    return checkedLog;
  }

  // find all by cursor pagination
  private async findAllByCursorPagination(
    user: UserWithoutPassword,
    pageSize: number,
    endCursor?: string,
  ) {
    // first page
    if (!endCursor) {
      const foundLogs = await this.prismaService.log.findMany({
        take: pageSize + 1,
        include: {
          images: true,
        },
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // get hasNextPage
      let hasNextPage = false;

      if (pageSize + 1 === foundLogs.length) {
        hasNextPage = true;
        foundLogs.pop();
      }

      // get has totalCount
      const totalCount = await this.prismaService.log.count({
        where: {
          userId: user.id,
        },
      });

      //get endCursor
      const endCursor =
        foundLogs.length > 0 ? encodeCursor(foundLogs[foundLogs.length - 1].createdAt) : null;

      return CursorPaginationLogResponseDto.fromLogIncludeImages(foundLogs, {
        pageSize,
        hasNextPage,
        endCursor,
        totalCount,
      });
    }

    //  after second page...
    const decodedEndCursor = decodeCursor('Date', endCursor);

    const foundLogs = await this.prismaService.log.findMany({
      take: pageSize + 1,
      include: {
        images: true,
      },
      where: {
        userId: user.id,
        createdAt: {
          lt: decodedEndCursor,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // get hasNextPage
    let hasNextPage = false;

    if (pageSize + 1 === foundLogs.length) {
      hasNextPage = true;
      foundLogs.pop();
    }

    // get has totalCount
    const totalCount = await this.prismaService.log.count({
      where: {
        userId: user.id,
      },
    });

    //get endCursor
    const endCursorResult =
      foundLogs.length > 0 ? encodeCursor(foundLogs[foundLogs.length - 1].createdAt) : null;

    return CursorPaginationLogResponseDto.fromLogIncludeImages(foundLogs, {
      pageSize,
      hasNextPage,
      endCursor: endCursorResult,
      totalCount,
    });
  }
}
