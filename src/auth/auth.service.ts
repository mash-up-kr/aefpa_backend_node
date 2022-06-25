import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserWithoutPassword } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validate(email: string, pass: string): Promise<UserWithoutPassword> {
    const foundUser = await this.userService.findUserByEmail(email);

    if (!foundUser) {
      throw new NotFoundException(`User not found with email: ${email}`);
    }

    if (!this.isValidPassword(foundUser.password, pass)) {
      throw new UnauthorizedException(`Password is incorrect.`);
    }

    const { password, ...result } = foundUser;
    return result;
  }

  private isValidPassword(original: string, target: string) {
    // TODO: Use encryption library
    return original === target;
  }
}
