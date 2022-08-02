import { CharacterType } from '@/api/server/generated';
import { CharacterStatus } from '@/home/character.types';

export interface LogStats {
  level: number; // 캐릭터 레벨
  progress: number; // 진행도의 현재 값
  max: number; // 진행도의 max 값
  today: number; // 오늘 끼록 횟수
  total: number; // 전체 끼록 횟수
}

export class HomeCharacterResponse {
  logStats: LogStats;
  name: string;
  type: CharacterType;
  status: CharacterStatus;
  lastFeedAt: string | null; // ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)

  // 상태에 따른 처리를 서버에서 할 경우
  imageUrl: string;
  phrase: string; // 캐릭터 문구
}