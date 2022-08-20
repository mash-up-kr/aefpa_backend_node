import { CharacterService } from '@/character/character.service';
import { HomeStatusResponse } from '@/home/dto/home-character.response';
import { PrismaService } from '@/prisma/prisma.service';
import { UserResponse } from '@/user/entity/user.dto';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private characterService: CharacterService,
  ) {}

  async getCharacterStatus(userId: number): Promise<HomeStatusResponse> {
    const mostRecentLog = await this.getMostRecentLog(userId);
    const lastFeedAt = mostRecentLog?.createdAt;
    const status = this.characterService.characterStatus(lastFeedAt);
    const profile = await this.userService.getUserProfile(userId);

    return {
      ...profile,
      status,
      lastFeedAt: lastFeedAt?.toISOString() ?? null,
      phrase: this.characterService.getPhrase(profile.type, status),
    };
  }

  private async getMostRecentLog(userId: number) {
    return (
      (await this.prismaService.log.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      })) ?? null
    );
  }

  /**
   * TODO: New indicator
   * TODO: Sort by the time when the log posted
   */
  async getFriends(userId: number): Promise<UserResponse[]> {
    const ret = await this.prismaService.follows.findMany({
      select: {
        following: {
          select: {
            id: true,
            userProfile: { select: { nickname: true } },
            userCharacter: { select: { characterType: true } },
          },
        },
      },
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return ret.map((item) => {
      return this.userService.mapUser(item.following);
    });
  }
}
