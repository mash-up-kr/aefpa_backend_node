import { CharacterType } from '@/api/server/generated';
import { CharacterStatus } from '@/character/character.types';

export interface LogStats {
  level: number; // 캐릭터 레벨
  progress: number; // 진행도의 현재 값
  max: number; // 진행도의 max 값
  total: number; // 전체 끼록 횟수
  today?: number; // 오늘 끼록 횟수
}

export class HomeCharacterResponse {
  logStats: LogStats;
  name: string;
  type: CharacterType;
  imageUrl: string;
  status: CharacterStatus;
  lastFeedAt: string | null; // ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
  phrase: string; // 캐릭터 문구
}
