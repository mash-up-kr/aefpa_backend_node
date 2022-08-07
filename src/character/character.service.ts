import { CharacterType } from '@/api/server/generated';
import { CharacterStatus } from '@/character/character.types';
import { S3Service } from '@/s3/s3.service';
import { zip } from '@/util/common';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

/**
 * TODO: as a module
 */
@Injectable()
export class CharacterService {
  private phrases: Record<CharacterType, Record<CharacterStatus, string>> = {
    GREEN_ONION: {
      happy: '아, 든든하게 잘 먹었어요~',
      sad: '해가 중천인데 배 안고파요?',
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

  constructor(private s3Service: S3Service) {}

  characterStatus(lastFeedAt?: Date, current?: Date): CharacterStatus {
    return lastFeedAt != null && moment.duration(moment(current).diff(lastFeedAt)).asHours() < 4
      ? 'happy'
      : 'sad';
  }

  calculateLogStats(numberOfLogs: number) {
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

  getCharacterImageUrl(type: CharacterType, size: 'mini' | 'full' = 'mini') {
    return this.s3Service.getUrl(`static/character/${size}/${type.toLowerCase()}.png`);
  }

  getPhrase(type: CharacterType, status: CharacterStatus) {
    return this.phrases[type][status];
  }
}