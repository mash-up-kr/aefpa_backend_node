import { Prisma } from '@/api/server/generated';
import { CharacterService } from '@/character/character.service';
import { LogStatsResponse } from '@/log/dto/log-stats.response';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class LogStatsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly characterService: CharacterService,
  ) {}

  async getLogCount(condition: Prisma.DetailLogWhereInput) {
    const [detailLogCount, logCount] = await Promise.all([
      this.prismaService.detailLog.count({ where: condition }),
      this.prismaService.log.count({ where: condition }),
    ]);

    return detailLogCount + logCount;
  }

  async getLogStats(userId: number, includeToday?: boolean): Promise<LogStatsResponse> {
    const numberOfLogsTotal = await this.getLogCount({ userId });
    const character = await this.prismaService.userCharacter.findFirst({ where: { userId } });
    const currentLevel = character?.level ?? 1;

    if (!includeToday)
      return {
        ...this.characterService.calculateLevelProgress(numberOfLogsTotal, currentLevel),
        total: numberOfLogsTotal,
      };

    const start = moment().utcOffset('+0900').startOf('day');
    const end = moment(start).utcOffset('+0900').add(1, 'day');
    const today = await this.getLogCount({
      userId,
      createdAt: {
        gte: start.toDate(),
        lt: end.toDate(),
      },
    });

    return {
      ...this.characterService.calculateLevelProgress(numberOfLogsTotal, currentLevel),
      total: numberOfLogsTotal,
      today,
    };
  }
}
