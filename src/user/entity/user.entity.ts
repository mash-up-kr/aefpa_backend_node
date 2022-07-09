import { User } from '@/api/server/generated';
import { TypesToOmit } from '@/util/types';

export class UserEntity implements User {
  id: number;
  email: string;
  password: string | null;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
}

// 1. 함수가 아닌 프로퍼티만 뽑기 (Pick)
// 2. password 제외하기 (Omit)
export type UserWithoutPassword = Omit<
  Pick<User, TypesToOmit<User, (...args: any) => any>>,
  'password'
>;

export function userWithoutPassword(user: User): UserWithoutPassword {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
