import { PrismaService } from '@/prisma/prisma.service';
import { UserEntity } from '@/user/entity/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<UserEntity | null> {
    return await this.prismaService.user.findUnique({ where: { id } });
  }

  async findUserByNickname(nickname: string): Promise<UserEntity> {
    const found = this.prismaService.user.findUnique({ where: { nickname } });
    if (!found) {
      throw new NotFoundException(`User not found with nickname: ${nickname}`);
    }
    return found;
  }
}
