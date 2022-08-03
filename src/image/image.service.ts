import { Image } from '@/api/server/generated';
import { checkExists } from '@/common/error-util';
import { ImageDto } from '@/image/dtos/image.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ImageService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(imageDto: ImageDto, logId: number) {
    const { original, w256, w1024 } = imageDto;

    return await this.prismaService.image.create({
      data: {
        original,
        w_256: w256,
        w_1024: w1024,
        log: {
          connect: {
            id: logId,
          },
        },
      },
    });
  }

  async delete(id: number) {
    try {
      return await this.prismaService.image.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(`${id} 이미지 삭제 실패`);
    }
  }

  async find(id: number): Promise<Image> {
    const foundImage = await this.prismaService.image.findUnique({
      where: {
        id,
      },
    });

    return checkExists(foundImage);
  }
}
