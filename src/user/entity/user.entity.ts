import { TypesToOmit } from '@/util/types';

// TODO: Add database connection
export class User {
  id: number;
  email: string;
  password: string;

  withoutPassword(): UserWithoutPassword {
    return {
      id: this.id,
      email: this.email,
    };
  }
}

// 1. 함수가 아닌 프로퍼티만 뽑기 (Pick)
// 2. password 제외하기 (Omit)
export type UserWithoutPassword = Omit<
  Pick<User, TypesToOmit<User, (...args: any) => any>>,
  'password'
>;
