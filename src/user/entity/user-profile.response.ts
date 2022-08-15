import { CharacterType } from '@/api/server/generated';
import { LogStatsResponse } from '@/log/dto/log-stats.response';

export class UserProfileResponse {
  logStats: LogStatsResponse;
  email: string;
  name: string;
  type: CharacterType;
  fullImageUrl: string;
  miniImageUrl: string;
}
