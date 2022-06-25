// TODO: Add database connection
export class User {
  id: number;
  email: string;
  password: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;
