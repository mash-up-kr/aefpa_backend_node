import { UserResponse } from '@/user/entity/user.dto';

export class UserWithFollowingResponse extends UserResponse {
  // Am I follow this user?
  following: boolean;
}
