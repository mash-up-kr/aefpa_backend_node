import { CharacterType } from '@/api/server/generated';
import { RandomService } from '@/common/random.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomCharacterService {
  constructor(private randomService: RandomService) {}

  getRandomCharacter(): CharacterType {
    const values = Object.values(CharacterType);
    return values[this.randomService.getRandomInt(0, values.length)];
  }
}
