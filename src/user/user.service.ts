import { CharacterType, Follows } from '@/api/server/generated';
import { CharacterService } from '@/character/character.service';
import { ErrorMessages } from '@/common/error-messages';
import { checkExists } from '@/common/error-util';
import { PrismaService } from '@/prisma/prisma.service';
import { UserWithFollowingResponse } from '@/user/entity/user-with-following.response';
import { UserEntity } from '@/user/entity/user.entity';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly characterService: CharacterService,
  ) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number): Promise<UserEntity | null> {
    return await this.prismaService.user.findUnique({ where: { id } });
  }

  async follow(followerId: number, followingId: number) {
    return await this.changeFollow(followerId, followingId, true);
  }

  async unfollow(followerId: number, followingId: number) {
    return await this.changeFollow(followerId, followingId, false);
  }

  private async changeFollow(
    followerId: number,
    followingId: number,
    shouldFollow: boolean,
  ): Promise<UserWithFollowingResponse> {
    const user = checkExists(
      await this.prismaService.user.findUnique({
        select: {
          id: true,
          userProfile: { select: { nickname: true } },
          userCharacter: { select: { characterType: true } },
        },
        where: { id: followingId },
      }),
    );

    const follow = await this.findFollow(followerId, followingId);

    if (follow == null && shouldFollow) {
      await this.prismaService.follows.create({
        data: {
          followerId,
          followingId,
        },
      });
    } else if (follow != null && !shouldFollow) {
      await this.prismaService.follows.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
    } else {
      throw new ConflictException(`already ${shouldFollow ? '' : 'not '}following`);
    }

    return {
      ...this.mapUser(user),
      following: shouldFollow,
    };
  }

  private async findFollow(followerId: number, followingId: number): Promise<Follows | null> {
    return await this.prismaService.follows.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  mapUser(following: {
    id: number;
    userProfile: { nickname: string } | null;
    userCharacter: { characterType: CharacterType } | null;
  }) {
    return {
      id: following.id,
      name: following.userProfile!.nickname,
      imageUrl: this.characterService.getCharacterImageUrl(following.userCharacter!.characterType),
    };
  }
}
