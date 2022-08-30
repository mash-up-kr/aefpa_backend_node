import { LogStatsService } from '@/log/log-stats.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Test } from '@nestjs/testing';

describe('LogStatsServiceTest', () => {
  let service: LogStatsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LogStatsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LogStatsService>(LogStatsService);
  });

  it('Log stats level 1', () => {
    const result = service.calculateLogStats(5, 1);
    expect(result.progress).toBe(5);
    expect(result.max).toBe(10);
  });

  it('Log stats level 2', () => {
    const result = service.calculateLogStats(15, 2);

    expect(result.progress).toBe(5);
    expect(result.max).toBe(20);
  });

  it('Log stats level 3 over', () => {
    const result = service.calculateLogStats(35, 3);

    expect(result.progress).toBe(30);
    expect(result.max).toBe(30);
  });
});
