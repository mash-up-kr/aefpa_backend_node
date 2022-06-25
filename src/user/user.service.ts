import { Injectable } from '@nestjs/common';
import { User } from '@/user/entity/user.entity';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    {
      id: 1,
      email: 'test@gmail.com',
      password: 'test',
    },
  ];

  async findUserByEmail(email: string): Promise<User | undefined> {
    // TODO: Add database connection
    return this.users.find((user) => user.email === email);
  }
}
