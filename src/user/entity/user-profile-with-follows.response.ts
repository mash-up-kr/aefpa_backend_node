import { CursorPaginationUserScrapLogResponseDto } from '@/user/dtos/cursor-pagination-user-scrap-log-response.dto';
import { UserProfileResponse } from '@/user/entity/user-profile.response';

export class UserProfileWithFollowsResponse extends UserProfileResponse {
  followerCount: number;
  followingCount: number;
  scrappedLogs: CursorPaginationUserScrapLogResponseDto;
}
