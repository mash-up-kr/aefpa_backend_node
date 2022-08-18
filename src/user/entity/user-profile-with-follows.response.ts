import { UserScrapLogDto } from '@/user/dtos/user-scrap-log.dto';
import { UserProfileResponse } from '@/user/entity/user-profile.response';

export class UserProfileWithFollowsResponse extends UserProfileResponse {
  followerCount: number;
  followingCount: number;
  scrappedLogs: UserScrapLogDto[];
}
