import { CharacterStatus } from '@/character/character.types';
import { UserProfileResponse } from '@/user/entity/user-profile.response';

export class HomeStatusResponse extends UserProfileResponse {
  status: CharacterStatus;
  lastFeedAt: string | null; // ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
  phrase: string; // 캐릭터 문구
  isFriend: boolean;
}
