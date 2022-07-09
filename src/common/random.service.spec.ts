import { RandomService } from '@/common/random.service';
import { Test } from '@nestjs/testing';

describe('RandomService', () => {
  let randomService: RandomService;

  const pool = 'ABCD';
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RandomService.withPool(pool)],
    }).compile();

    randomService = moduleRef.get<RandomService>(RandomService);
  });

  describe('getRandomInt', () => {
    it('value is in the range', async () => {
      Array(100)
        .fill(0)
        .forEach((_, index) => {
          const value = randomService.getRandomInt(0, 10);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(10);
        });
    });
  });

  describe('getRandomAuthCode', () => {
    it('length should be the same', async () => {
      expect(randomService.getRandomAuthCode(6).length).toEqual(6);
    });
    it('only contain strings within the pool', async () => {
      expect(randomService.getRandomAuthCode(200)).not.toContainEqual('E');
    });
  });
});
