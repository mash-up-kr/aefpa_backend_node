import { RandomCharacterService } from '@/character/random.character.service';
import { HomeCharacterResponse } from '@/home/dto/home-character.response';
import { PrismaService } from '@/prisma/prisma.service';
import { zip } from '@/util/common';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class HomeService {
  constructor(
    private prismaService: PrismaService,
    private randomCharacterService: RandomCharacterService,
  ) {}

  async getCharacterStatus(userId: number): Promise<HomeCharacterResponse> {
    const character = await this.getOrCreateCharacter(userId);
    const type = character.characterType;
    const mostRecentLog = await this.getMostRecentLog(userId);
    const lastFeedAt = mostRecentLog?.createdAt;

    return {
      logStatus: await this.getLogStatus(userId),
      type,
      lastFeedAt: lastFeedAt?.toISOString() ?? null,
      status:
        lastFeedAt != null && moment.duration(moment().diff(lastFeedAt)).asHours() < 4
          ? 'happy'
          : 'sad',
      // TODO: Implementation
      imageUrl: '',
      name: '',
      phrase: '',
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

  private async getLogStatus(userId: number) {
    const numberOfLogsTotal = await this.prismaService.log.count({
      where: { userId },
    });

    const start = moment().utc().startOf('day');
    const end = moment(start).utc().add(1, 'day');
    const numberOfLogsToday = await this.prismaService.log.count({
      where: {
        userId,
        updatedAt: {
          gte: start.toDate(),
          lt: end.toDate(),
        },
      },
    });

    return {
      ...this.calculateStatus(numberOfLogsTotal),
      today: numberOfLogsToday,
    };
  }

  private calculateStatus(numberOfLogs: number) {
    const goals = [0, 10, 30];
    const zipped = zip(goals, [...goals.slice(1), undefined]);

    for (let i = 0; i < zipped.length; i++) {
      const [prev, next] = zipped[i];
      if (numberOfLogs >= prev && (next == null || numberOfLogs < next)) {
        const level = i + 1;
        const max = next != null ? next - prev : prev;
        const progress = next != null ? numberOfLogs - prev : prev;

        return {
          level,
          max,
          progress,
          total: numberOfLogs,
        };
      }
    }

    return {
      level: 1,
      max: 10,
      progress: 0,
      total: numberOfLogs,
    };
  }
}
