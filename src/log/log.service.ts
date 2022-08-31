import { checkExists, checkNotExists } from '@/common/error-util';
import { ImageService } from '@/image/image.service';
import { CreateLogDto } from '@/log/dto/request/create-log.dto';
import { LogDto } from '@/log/dto/log.dto';
import { UpdateLogDto } from '@/log/dto/request/update-log.dto';
import { LogWithImages } from '@/log/log.types';
import { PrismaService } from '@/prisma/prisma.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CursorPaginationRequestDto } from '@/common/dto/request/pagination-request.dto';
import { CursorPaginationLogResponseDto } from '@/log/dto/response/cursor-pagination-log-response.dto';
import { decodeCursor, encodeCursor } from '@/util/cursor-paginate';
import { S3Service } from '@/s3/s3.service';
import * as moment from 'moment';
import { ShortLogResponseDto } from '@/common/dto/response/short-log-response.dto';

@Injectable()
export class LogService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imageService: ImageService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createLogDto: CreateLogDto,
    images: Express.Multer.File[],
    user: UserWithoutPassword,
  ): Promise<LogDto> {
    const { title, description, kick } = createLogDto;

    const uploadedImages = await this.s3Service.upload(images, 'log');

    const log = await this.prismaService.log.create({
      include: { images: true, goodUsers: true, scrapUsers: true },
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
          create: uploadedImages.map((imageUrl) => {
            return {
              original: imageUrl.original,
              w_256: imageUrl.w256,
              w_1024: imageUrl.w1024,
            };
          }),
        },
      },
    });

    return LogDto.fromLogIncludeImages(log, user.id);
  }

  async findAll(cursorPaginationRequestDto: CursorPaginationRequestDto, userId: number) {
    const { pageSize, endCursor } = cursorPaginationRequestDto;

    // find all without cursor pagination
    if (!pageSize) {
      const foundLogs = await this.prismaService.log.findMany({
        include: {
          images: true,
          goodUsers: true,
          scrapUsers: true,
        },
        where: {
          userId,
        },
        orderBy: {
          id: 'desc',
        },
      });

      return foundLogs.map((foundLog): ShortLogResponseDto => {
        return {
          id: foundLog.id,
          image: {
            original: foundLog.images[0].original,
            w256: foundLog.images[0].w_256,
            w1024: foundLog.images[0].w_1024,
          },
          createdAt: moment(foundLog.createdAt).format(),
          title: foundLog.title,
        };
      });
    }

    return await this.findAllByCursorPagination(userId, pageSize, endCursor);
  }

  async findById(id: number, user: UserWithoutPassword): Promise<LogDto> {
    const foundLog = await this.prismaService.log.findUnique({
      include: {
        images: true,
        user: true,
        goodUsers: true,
        scrapUsers: true,
      },
      where: {
        id,
      },
    });

    const checkedLog = checkExists(foundLog, 'log');

    return LogDto.fromLogIncludeImages(checkedLog, user.id);
  }

  async update(
    id: number,
    updateLogDto: UpdateLogDto,
    images: Express.Multer.File[],
    user: UserWithoutPassword,
  ): Promise<LogDto> {
    const { title, description, kick } = updateLogDto;

    const checkedLog = await this.checkAuthentication(user, id);

    const uploadedImages = await this.s3Service.upload(images, 'log');

    // transaction start
    const updateLog = await this.prismaService.$transaction(async () => {
      // 기존 이미지는 모두 삭제
      await Promise.all(checkedLog.images.map((image) => this.imageService.delete(image.id)));

      // 수정한 이미지는 모두 생성
      await Promise.all(
        uploadedImages.map((image) => this.imageService.create(image, checkedLog.id)),
      );

      //update
      const updateLog = await this.prismaService.log.update({
        include: {
          images: true,
          goodUsers: true,
          scrapUsers: true,
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

      return updateLog;
    });
    // transaction end

    return LogDto.fromLogIncludeImages(updateLog, user.id);
  }

  async delete(id: number, user: UserWithoutPassword) {
    const checkedLog = await this.checkAuthentication(user, id);

    // transaction start
    await this.prismaService.$transaction(async () => {
      await this.prismaService.log.delete({
        where: {
          id: checkedLog.id,
        },
      });

      await Promise.all(checkedLog.images.map((image) => this.imageService.delete(image.id)));
    });
    // transaction end
  }

  async like(logId: number, user: UserWithoutPassword, type: 'like' | 'unlike') {
    const foundLog = await this.findById(logId, user);

    const foundUserGoodLog = await this.prismaService.userGoodLog.findFirst({
      where: {
        userId: user.id,
        logId: logId,
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
          log: {
            include: {
              images: true,
              goodUsers: true,
              scrapUsers: true,
            },
          },
        },
        data: {
          userId: user.id,
          logId: foundLog.id,
        },
      });

      return LogDto.fromLogIncludeImages(userGoodLogs.log as LogWithImages, user.id);
    }
    // if unlike
    else {
      // if not exists throw exception
      try {
        checkExists(foundUserGoodLog, 'log');
      } catch (err) {
        throw new BadRequestException('already UNLIKE');
      }

      await this.prismaService.userGoodLog.deleteMany({
        where: {
          logId: logId,
          userId: user.id,
        },
      });

      // delete한건 한번더 조회해야한다.
      const log = (await this.prismaService.log.findUnique({
        include: {
          images: true,
          goodUsers: true,
          scrapUsers: true,
        },
        where: {
          id: logId,
        },
      })) as LogWithImages;

      return LogDto.fromLogIncludeImages(log, user.id);
    }
  }

  async scrap(logId: number, user: UserWithoutPassword, type: 'scrap' | 'unscrap') {
    const foundLog = await this.findById(logId, user);

    const foundUserScrapLog = await this.prismaService.userScrapLog.findFirst({
      where: {
        userId: user.id,
        logId: logId,
      },
    });

    // scrap
    if (type === 'scrap') {
      // if already exists throw exception
      try {
        checkNotExists(foundUserScrapLog, 'log');
      } catch (err) {
        throw new BadRequestException('already SCRAPPED');
      }

      const userScrapLog = await this.prismaService.userScrapLog.create({
        include: {
          log: {
            include: {
              images: true,
              goodUsers: true,
              scrapUsers: true,
            },
          },
        },
        data: {
          userId: user.id,
          logId: foundLog.id,
        },
      });

      return LogDto.fromLogIncludeImages(userScrapLog.log as LogWithImages, user.id);
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
          logId: logId,
          userId: user.id,
        },
      });

      // delete한건 한번더 조회해야한다.
      const log = (await this.prismaService.log.findUnique({
        include: {
          images: true,
          goodUsers: true,
          scrapUsers: true,
        },
        where: {
          id: logId,
        },
      })) as LogWithImages;

      return LogDto.fromLogIncludeImages(log, user.id);
    }
  }

  private async checkAuthentication(
    user: UserWithoutPassword,
    logId: number,
  ): Promise<LogWithImages> {
    const foundLog = await this.prismaService.log.findUnique({
      include: {
        images: true,
        goodUsers: true,
        scrapUsers: true,
      },
      where: {
        id: logId,
      },
    });

    const checkedLog = checkExists(foundLog, 'log');

    if (user.id !== checkedLog.userId) {
      throw new UnauthorizedException('해당 유저는 접근할 수 없는 리소스입니다.');
    }

    return checkedLog;
  }

  // find all by cursor pagination
  private async findAllByCursorPagination(userId: number, pageSize: number, endCursor?: string) {
    // first page
    if (!endCursor) {
      const foundLogs = await this.prismaService.log.findMany({
        take: pageSize + 1, // 다음 페이지 존재 여부를 확인하기 위해 하나더 조회
        include: {
          images: true,
          goodUsers: true,
          scrapUsers: true,
        },
        where: {
          userId,
        },
        orderBy: {
          id: 'desc',
        },
      });

      // get hasNextPage
      let hasNextPage = false;

      if (pageSize + 1 === foundLogs.length) {
        hasNextPage = true;
        foundLogs.pop(); // 다음 페이지 존재하면 pop
      }

      // get has totalCount
      const totalCount = await this.prismaService.log.count({
        where: {
          userId: userId,
        },
      });

      //get endCursor
      const endCursor =
        foundLogs.length > 0 ? encodeCursor(foundLogs[foundLogs.length - 1].id) : null;

      return CursorPaginationLogResponseDto.fromLogIncludeImages(foundLogs, userId, {
        pageSize,
        hasNextPage,
        endCursor,
        totalCount,
      });
    }

    //  after second page...
    const decodedEndCursor = decodeCursor('number', endCursor) as number;

    const foundLogs = await this.prismaService.log.findMany({
      take: pageSize + 1, // 다음 페이지 존재 여부를 확인하기 위해 하나 더 조회
      include: {
        images: true,
        goodUsers: true,
        scrapUsers: true,
      },
      where: {
        userId: userId,
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

    if (pageSize + 1 === foundLogs.length) {
      hasNextPage = true;
      foundLogs.pop(); // 다음 페이지 존재하면 pop
    }

    // get has totalCount
    const totalCount = await this.prismaService.log.count({
      where: {
        userId: userId,
      },
    });

    //get endCursor
    const endCursorResult =
      foundLogs.length > 0 ? encodeCursor(foundLogs[foundLogs.length - 1].id) : null;

    return CursorPaginationLogResponseDto.fromLogIncludeImages(foundLogs, userId, {
      pageSize,
      hasNextPage,
      endCursor: endCursorResult,
      totalCount,
    });
  }
}
