import { CharacterType } from '@/api/server/generated';
import { CharacterStatus } from '@/home/character.types';
import { S3Service } from '@/s3/s3.service';
import { zip } from '@/util/common';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

/**
 * TODO: as a module
 */
@Injectable()
export class CharacterService {
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

  getCharacterImageUrl(type: CharacterType) {
    return this.s3Service.getUrl(`static/character/${type.toLowerCase()}.png`);
  }

  getPhrase(type: CharacterType, status: CharacterStatus) {
    switch (type) {
      case 'GREEN_ONION':
        return status === 'happy' ? '아, 든든하게 잘 먹었어요~' : '해가 중천인데 배 안고파요?';
      case 'CARROT':
        return status === 'happy' ? '오늘도 에너지 충전! 감사해요' : '혹시 배는 언제 고파질까요..?';
      case 'BROCCOLI':
        return status === 'happy' ? 'A-Yo! 밥 먹었더니 신난다!' : 'Hey~ 밥먹고 합시다!! 배고파~';
    }
  }
}
