import { checkExists } from '@/common/error-util';
import { ImageService } from '@/image/image.service';
import { CreateLogDto } from '@/log/dto/create-log.dto';
import { LogDto } from '@/log/dto/log.dto';
import { UpdateLogDto } from '@/log/dto/update-log.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { LogWithImages } from '@/log/log.types';
import { Injectable, UnauthorizedException } from '@nestjs/common';

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

  async findAll(user: UserWithoutPassword): Promise<LogDto[]> {
    const foundLogs = await this.prismaService.log.findMany({
      include: {
        images: true,
      },
      where: {
        userId: user.id,
      },
    });

    return foundLogs.map((foundLog) => LogDto.fromLogIncludeImages(foundLog));
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

    const existImages = checkedLog.images;
    const existImageUrls = existImages.map((image) => image.url);

    const deleteImages = existImages.filter((existUrl) => !imageUrls.includes(existUrl.url));
    const insertUrls = imageUrls.filter((imageUrl) => !existImageUrls.includes(imageUrl));

    // transaction start
    const updateLog = await this.prismaService.$transaction(async () => {
      // 삭제할 이미지는 삭제
      await Promise.all(deleteImages.map((image) => this.imageService.delete(image.id)));
      // 추가할 이미지는 추가
      await Promise.all(insertUrls.map((url) => this.imageService.create(url, checkedLog.id)));

      //update
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

      return updateLog;
    });
    // transaction end

    return LogDto.fromLogIncludeImages(updateLog);
  }

  async delete(id: number, user: UserWithoutPassword): Promise<boolean> {
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
}
