import { CharacterType } from '@/api/server/generated';
import { LogStatsResponse } from '@/log/dto/log-stats.response';

export class UserProfileResponse {
  logStats: LogStatsResponse;
  name: string;
  type: CharacterType;
  imageUrl: string;
  followerCount: number;
  followingCount: number;
}
