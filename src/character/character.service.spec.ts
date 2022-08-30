import { CharacterService } from '@/character/character.service';
import { S3Service } from '@/s3/s3.service';
import { Test } from '@nestjs/testing';

describe('CharacterServiceTest', () => {
  let service: CharacterService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CharacterService,
        {
          provide: S3Service,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CharacterService>(CharacterService);
  });

  it('Character level 1', () => {
    const result = service.calculateLevelProgress(5, 1);
    expect(result.progress).toBe(5);
    expect(result.max).toBe(10);
  });

  it('Character level 2', () => {
    const result = service.calculateLevelProgress(15, 2);

    expect(result.progress).toBe(5);
    expect(result.max).toBe(20);
  });

  it('Character level 3 over', () => {
    const result = service.calculateLevelProgress(35, 3);

    expect(result.progress).toBe(30);
    expect(result.max).toBe(30);
  });
});
