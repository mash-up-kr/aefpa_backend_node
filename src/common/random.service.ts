import { Injectable, ValueProvider } from '@nestjs/common';

@Injectable()
export class RandomService {
  static defaultPool: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static withPool(pool: string = RandomService.defaultPool): ValueProvider<RandomService> {
    return {
      provide: RandomService,
      useValue: new RandomService(pool),
    };
  }

  constructor(private readonly pool: string = RandomService.defaultPool) {}

  getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

  getRandomAuthCode(length: number): string {
    return Array(length)
      .fill(0)
      .map(() => this.pool[this.getRandomInt(0, this.pool.length)])
      .join('');
  }
}
