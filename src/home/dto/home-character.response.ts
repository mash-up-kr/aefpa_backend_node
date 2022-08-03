import { CharacterType } from '@/api/server/generated';
import { CharacterStatus } from '@/character/character.types';
import { LogStatsResponse } from '../../log/dto/log-stats.response';

export class HomeCharacterResponse {
  logStats: LogStatsResponse;
  name: string;
  type: CharacterType;
  imageUrl: string;
  status: CharacterStatus;
  lastFeedAt: string | null; // ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
  phrase: string; // 캐릭터 문구
}
