import { CharacterType, Follows, Prisma } from '@/api/server/generated';
import { CharacterService } from '@/character/character.service';
import { checkExists } from '@/common/error-util';
import { LogStatsService } from '@/log/log-stats.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CursorPaginationUserScrapLogResponseDto } from '@/user/dtos/cursor-pagination-user-scrap-log-response.dto';
import { UserScrapLogDto } from '@/user/dtos/user-scrap-log.dto';
import { UserProfileWithFollowsResponse } from '@/user/entity/user-profile-with-follows.response';
import { UserProfileResponse } from '@/user/entity/user-profile.response';
import { UserWithFollowingResponse } from '@/user/entity/user-with-following.response';
import { UserEntity } from '@/user/entity/user.entity';
import { FriendType } from '@/user/user.types';
import { decodeCursor, encodeCursor } from '@/util/cursor-paginate';
import { ConflictException, Injectable } from '@nestjs/common';

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
      imageUrl: this.characterService.getFullCharacterImageUrl(
        following.userCharacter!.characterType,
      ),
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

  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const found = checkExists(
      await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          userCharacter: { select: { characterType: true } },
          userProfile: { select: { nickname: true } },
        },
      }),
    );

    const type = found.userCharacter!.characterType;

    const logStats = await this.logStatsService.getLogStats(userId, true);

    return {
<<<<<<< Updated upstream
      logStats: await this.logStatsService.getLogStats(userId, true),
=======
<<<<<<< Updated upstream
      logStats: await this.logStatsService.getLogStats(userId),
=======
      logStats,
>>>>>>> Stashed changes
>>>>>>> Stashed changes
      email: found.email,
      name: found.userProfile?.nickname ?? '',
      type,
      miniImageUrl: this.characterService.getFullCharacterImageUrl(type, 0, 'mini'),
      fullImageUrl: this.characterService.getFullCharacterImageUrl(type, logStats.level, 'full'),
    };
  }

  async getUserProfileWithFollows(userId: number): Promise<UserProfileWithFollowsResponse> {
    const profile = await this.getUserProfile(userId);

    const followerCount = await this.prismaService.follows.count({
      where: { followingId: userId },
    });

    const followingCount = await this.prismaService.follows.count({
      where: { followerId: userId },
    });

    const scrappedLogs = await this.prismaService.userScrapLog.findMany({
      include: {
        log: {
          include: {
            images: true,
          },
        },
        detailLog: {
          include: {
            image: true,
          },
        },
      },
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      ...profile,
      followerCount,
      followingCount,
      scrappedLogs: scrappedLogs.map((scrappedLog) =>
        UserScrapLogDto.fromUserScrapLog(scrappedLog),
      ),
    };
  }

  async deleteUser(userId: number) {
    return await this.prismaService.user.delete({
      where: { id: userId },
    });
  }

  // find all by cursor pagination
  private async findAllByCursorPagination(userId: number, pageSize: number, endCursor?: string) {
    // first page
    if (!endCursor) {
      const foundUserScrapLogs = await this.prismaService.userScrapLog.findMany({
        take: pageSize + 1, // 다음 페이지 존재 여부를 확인하기 위해 하나더 조회
        include: {
          log: {
            include: {
              images: true,
            },
          },
          detailLog: {
            include: {
              image: true,
            },
          },
        },
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // get hasNextPage
      let hasNextPage = false;

      if (pageSize + 1 === foundUserScrapLogs.length) {
        hasNextPage = true;
        foundUserScrapLogs.pop(); // 다음 페이지 존재하면 pop
      }

      // get has totalCount
      const totalCount = await this.prismaService.userScrapLog.count({
        where: {
          userId,
        },
      });

      //get endCursor
      const endCursor =
        foundUserScrapLogs.length > 0
          ? encodeCursor(foundUserScrapLogs[foundUserScrapLogs.length - 1].createdAt)
          : null;

      return CursorPaginationUserScrapLogResponseDto.fromUserScrapLog(foundUserScrapLogs, {
        pageSize,
        hasNextPage,
        endCursor,
        totalCount,
      });
    }

    //  after second page...
    const decodedEndCursor = decodeCursor('Date', endCursor) as Date;

    const foundUserScrapLogs = await this.prismaService.userScrapLog.findMany({
      take: pageSize + 1, // 다음 페이지 존재 여부를 확인하기 위해 하나 더 조회
      include: {
        log: {
          include: {
            images: true,
          },
        },
        detailLog: {
          include: {
            image: true,
          },
        },
      },
      where: {
        userId,
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

    if (pageSize + 1 === foundUserScrapLogs.length) {
      hasNextPage = true;
      foundUserScrapLogs.pop(); // 다음 페이지 존재하면 pop
    }

    // get has totalCount
    const totalCount = await this.prismaService.userScrapLog.count({
      where: {
        userId,
      },
    });

    //get endCursor
    const endCursorResult =
      foundUserScrapLogs.length > 0
        ? encodeCursor(foundUserScrapLogs[foundUserScrapLogs.length - 1].createdAt)
        : null;

    return CursorPaginationUserScrapLogResponseDto.fromUserScrapLog(foundUserScrapLogs, {
      pageSize,
      hasNextPage,
      endCursor: endCursorResult,
      totalCount,
    });
  }
}
