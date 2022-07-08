import { PrismaService } from '@/prisma/prisma.service';
import { UserEntity } from '@/user/entity/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string): Promise<UserEntity> {
    const found = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!found) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }
    return found;
  }

  async findUserById(id: number): Promise<UserEntity> {
    // TODO: Add database connection
    const found = this.prismaService.user.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return found;
  }
}
