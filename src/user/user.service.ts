import { User } from '@/user/entity/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly users: User[] = [new User(1, 'test@gmail.com', 'test')];

  async findUserByEmail(email: string): Promise<User> {
    // TODO: Add database connection
    const found = this.users.find((user) => user.email === email);
    if (!found) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }
    return found;
  }

  async findUserById(id: number): Promise<User> {
    // TODO: Add database connection
    const found = this.users.find((user) => user.id === id);
    if (!found) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }
    return found;
  }
}
