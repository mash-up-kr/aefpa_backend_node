import { CharacterType, Follows, Prisma } from '@/api/server/generated';
import { CharacterService } from '@/character/character.service';
import { checkExists } from '@/common/error-util';
import { LogStatsService } from '@/log/log-stats.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UserProfileWithFollowsResponse } from '@/user/entity/user-profile-with-follows.response';
import { UserWithFollowingResponse } from '@/user/entity/user-with-following.response';
import { UserEntity } from '@/user/entity/user.entity';
import { FriendType } from '@/user/user.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logStatsService: LogStatsService,
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

  async getFriendsList(
    userId: number,
    type: FriendType,
    keyword?: string,
  ): Promise<UserWithFollowingResponse[]> {
    const userWhere: Prisma.UserWhereInput = {};

    if (keyword != null) {
      keyword = keyword.trim();

      const found = await this.prismaService.userProfile.findUnique({
        select: { userId: true },
        where: { nickname: keyword },
      });

      if (!found) return [];

      userWhere.id = found.userId;
    } else {
      userWhere.followedBy = type === 'following' ? { some: { followerId: userId } } : undefined;
      userWhere.following = type === 'follower' ? { some: { followingId: userId } } : undefined;
    }

    const users = await this.prismaService.user.findMany({
      where: userWhere,
      select: {
        id: true,
        userProfile: { select: { nickname: true } },
        userCharacter: { select: { characterType: true } },
        followedBy: { select: { followerId: true } },
      },
    });

    return users.map((item) => {
      return {
        ...this.mapUser(item),
        following: item.followedBy.map((item) => item.followerId).includes(userId),
      };
    });
  }

  async getUserProfile(userId: number): Promise<UserProfileWithFollowsResponse> {
    const found = checkExists(
      await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          userCharacter: { select: { characterType: true } },
          userProfile: { select: { nickname: true } },
        },
      }),
    );

    const followerCount = await this.prismaService.follows.count({
      where: { followingId: userId },
    });

    const followingCount = await this.prismaService.follows.count({
      where: { followerId: userId },
    });

    const type = found.userCharacter!.characterType;

    return {
      logStats: await this.logStatsService.getLogStats(userId),
      name: found.userProfile?.nickname ?? '',
      type,
      imageUrl: this.characterService.getCharacterImageUrl(type),
      followerCount,
      followingCount,
    };
  }
}
