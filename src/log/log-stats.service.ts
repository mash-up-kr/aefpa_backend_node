import { Prisma } from '@/api/server/generated';
import { LogStatsResponse } from '@/log/dto/log-stats.response';
import { PrismaService } from '@/prisma/prisma.service';
import { zip } from '@/util/common';
import { Injectable } from '@nestjs/common';
import { clamp } from 'lodash';
import * as moment from 'moment';

@Injectable()
export class LogStatsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getLogCount(condition: Prisma.DetailLogWhereInput) {
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

    if (!includeToday) return this.calculateLogStats(numberOfLogsTotal, currentLevel);

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
      ...this.calculateLogStats(numberOfLogsTotal, currentLevel),
      today,
    };
  }

  calculateLogStats(numberOfLogs: number, currentLevel: number) {
    const level = clamp(currentLevel, 1, 3);

    const goals = [0, 10, 30];
    const zipped = zip(goals, [...goals.slice(1), undefined]);

    const [prev, next] = zipped[level - 1];
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
