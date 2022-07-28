import { CharacterType } from '@/api/server/generated';
import { UserWithoutPassword } from '@/user/entity/user.entity';

export class SignUpResponse {
  user: UserWithoutPassword;
  character: CharacterType;
  token: string;
}
