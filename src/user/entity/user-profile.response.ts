import { CharacterType } from '@/api/server/generated';
import { LogStats } from '@/home/dto/home-character.response';

export class UserProfileResponse {
  logStats: LogStats;
  name: string;
  type: CharacterType;
  imageUrl: string;
  followerCount: number;
  followingCount: number;
}
