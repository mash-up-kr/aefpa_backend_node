import { CharacterType } from '@/api/server/generated';
import { CharacterStatus } from '@/character/character.types';
import { S3Service } from '@/s3/s3.service';
import { zip } from '@/util/common';
import { Injectable } from '@nestjs/common';
import { clamp } from 'lodash';
import * as moment from 'moment';

/**
 * TODO: as a module
 */
@Injectable()
export class CharacterService {
  private phrases: Record<CharacterType, Record<CharacterStatus, string>> = {
    GREEN_ONION: {
      happy: '아, 든든하게 잘 먹었어요~',
      sad: '배고파! 일단 뭐라도 먹자!',
    },
    CARROT: {
      happy: '오늘도 에너지 충전! 감사해요',
      sad: '혹시 배는 언제 고파질까요..?',
    },
    BROCCOLI: {
      happy: 'A-Yo! 밥 먹었더니 신난다!',
      sad: 'Hey~ 밥먹고 합시다!! 배고파~',
    },
  };

  private levelRequirements = [0, 10, 30];

  constructor(private s3Service: S3Service) {}

  characterStatus(lastFeedAt?: Date, current?: Date): CharacterStatus {
    return lastFeedAt != null && moment.duration(moment(current).diff(lastFeedAt)).asHours() < 4
      ? 'happy'
      : 'sad';
  }

  getMiniCharacterImageUrl(type: CharacterType) {
    return this.s3Service.getUrl(`static/character/mini/${type.toLowerCase()}.png`);
  }

  getFullCharacterImageUrl(type: CharacterType, level: number, status: CharacterStatus) {
    return this.s3Service.getUrl(
      `static/character/full/${type.toLowerCase()}_${level}_${status}.png`,
    );
  }

  getPhrase(type: CharacterType, status: CharacterStatus) {
    return this.phrases[type][status];
  }

  calculateLevelProgress(numberOfLogs: number, currentLevel: number) {
    const level = clamp(currentLevel, 1, 3);
    const zipped = zip(this.levelRequirements, [...this.levelRequirements.slice(1), undefined]);
    const [prev, next] = zipped[level - 1];
    const max = next != null ? next - prev : prev;
    const progress = next != null ? numberOfLogs - prev : prev;

    return {
      level,
      max,
      progress,
    };
  }

  checkLevelUpRequirement(numberOfLogs: number, currentLevel: number) {
    if (currentLevel >= this.levelRequirements.length) return false;
    const { max, progress } = this.calculateLevelProgress(numberOfLogs, currentLevel);
    return progress >= max;
  }
}
