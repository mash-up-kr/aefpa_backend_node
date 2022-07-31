import { CharacterType } from '@/api/server/generated';
import { RandomCharacterService } from '@/character/random.character.service';
import { CharacterStatus } from '@/home/character.types';
import { HomeCharacterResponse } from '@/home/dto/home-character.response';
import { PrismaService } from '@/prisma/prisma.service';
import { S3Service } from '@/s3/s3.service';
import { zip } from '@/util/common';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class HomeService {
  constructor(
    private s3Service: S3Service,
    private prismaService: PrismaService,
    private randomCharacterService: RandomCharacterService,
  ) {}

  async getCharacterStatus(userId: number): Promise<HomeCharacterResponse> {
    const character = await this.getOrCreateCharacter(userId);
    const type = character.characterType;
    const mostRecentLog = await this.getMostRecentLog(userId);
    const lastFeedAt = mostRecentLog?.createdAt;
    const status =
      lastFeedAt != null && moment.duration(moment().diff(lastFeedAt)).asHours() < 4
        ? 'happy'
        : 'sad';

    return {
      logStatus: await this.getLogStatus(userId),
      nickname: '',
      type,
      status,
      lastFeedAt: lastFeedAt?.toISOString() ?? null,
      imageUrl: this.getCharacterImageUrl(type),
      phrase: this.getPhrase(type, status),
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

  private getCharacterImageUrl(type: CharacterType) {
    return this.s3Service.getUrl(`static/character/${type.toLowerCase()}.png`);
  }

  private getPhrase(type: CharacterType, status: CharacterStatus) {
    switch (type) {
      case 'GREEN_ONION':
        return status === 'happy' ? '아, 든든하게 잘 먹었어요~' : '해가 중천인데 배 안고파요?';
      case 'CARROT':
        return status === 'happy' ? '오늘도 에너지 충전! 감사해요' : '혹시 배는 언제 고파질까요..?';
      case 'BROCCOLI':
        return status === 'happy' ? 'A-Yo! 밥 먹었더니 신난다!' : 'Hey~ 밥먹고 합시다!! 배고파~';
    }
  }
}
