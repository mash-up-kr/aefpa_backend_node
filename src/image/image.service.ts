import { Image } from '@/api/server/generated';
import { checkExists } from '@/common/error-util';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class ImageService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(url: string, logId: number) {
    return await this.prismaService.image.create({
      data: {
        url,
        log: {
          connect: {
            id: logId,
          },
        },
      },
    });
  }

  async delete(id: number) {
    const foundImage = await this.find(id);
    try {
      return await this.prismaService.image.delete({
        where: {
          id: foundImage.id,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(`${id} 이미지 삭제 실패`);
    }
  }

  async find(id: number): Promise<Image> {
    const foundImages = await this.prismaService.image.findUnique({
      where: {
        id,
      },
    });

    const checkedImage = checkExists(foundImages);

    return checkedImage;
  }
}
