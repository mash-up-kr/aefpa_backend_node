import { RandomCharacterService } from '@/character/random.character.service';
import { CharacterService } from '@/home/character.service';
import { HomeCharacterResponse } from '@/home/dto/home-character.response';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class HomeService {
  constructor(
    private prismaService: PrismaService,
    private characterService: CharacterService,
    private randomCharacterService: RandomCharacterService,
  ) {}

  async getCharacterStatus(userId: number): Promise<HomeCharacterResponse> {
    const character = await this.getOrCreateCharacter(userId);
    const type = character.characterType;

    const profile = await this.prismaService.userProfile.findUnique({
      where: { id: userId },
    });

    const mostRecentLog = await this.getMostRecentLog(userId);
    const lastFeedAt = mostRecentLog?.createdAt;
    const status = this.characterService.characterStatus(lastFeedAt);

    return {
      logStats: await this.getLogStats(userId),
      nickname: profile?.nickname ?? '',
      type,
      status,
      lastFeedAt: lastFeedAt?.toISOString() ?? null,
      imageUrl: this.characterService.getCharacterImageUrl(type),
      phrase: this.characterService.getPhrase(type, status),
    };
  }

  private async getOrCreateCharacter(userId: number) {
    return (
      (await this.prismaService.userCharacter.findUnique({
        where: { userId },
      })) ??
      (await this.prismaService.userCharacter.create({
        data: {
          userId,
          characterType: this.randomCharacterService.getRandomCharacter(),
        },
      }))
    );
  }

  private async getMostRecentLog(userId: number) {
    return (
      (await this.prismaService.log.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      })) ?? null
    );
  }

  private async getLogStats(userId: number) {
    const numberOfLogsTotal = await this.prismaService.log.count({
      where: { userId },
    });

    const start = moment().utcOffset('+0900').startOf('day');
    const end = moment(start).utcOffset('+0900').add(1, 'day');
    const numberOfLogsToday = await this.prismaService.log.count({
      where: {
        userId,
        createdAt: {
          gte: start.toDate(),
          lt: end.toDate(),
        },
      },
    });

    return {
      ...this.characterService.calculateLogStats(numberOfLogsTotal),
      today: numberOfLogsToday,
    };
  }
}
