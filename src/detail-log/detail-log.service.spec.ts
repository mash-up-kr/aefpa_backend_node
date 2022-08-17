import { DetailLogService } from '@/detail-log/detail-log.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('DetailLogService', () => {
  let service: DetailLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailLogService],
    }).compile();

    service = module.get<DetailLogService>(DetailLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
