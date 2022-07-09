import { AuthCodeType } from '@/auth/auth.types';
import { JwtPayload } from '@/auth/jwt.types';
import { checkExists, checkNotExists } from '@/common/error-util';
import { RandomService } from '@/common/random.service';
import { userWithoutPassword, UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private randomService: RandomService,
  ) {}

  async validate(email: string, pass: string): Promise<UserWithoutPassword> {
    const foundUser = checkExists(await this.userService.findUserByEmail(email));

    if (!this.isValidPassword(foundUser.password, pass)) {
      throw new UnauthorizedException(`Password is incorrect.`);
    }

    return userWithoutPassword(foundUser);
  }

  private isValidPassword(original: string, target: string) {
    // TODO: Use encryption library
    return original === target;
  }

  async createJwtFromUser(user: UserWithoutPassword) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return await this.jwtService.signAsync(payload);
  }

  async generateAuthCode(email: string, type: AuthCodeType) {
    checkNotExists(await this.userService.findUserByEmail(email));

    const code = this.randomService.getRandomAuthCode(6);

    // TODO: Record to UserCode
    // TODO: Send mail to email

    return true;
  }
}
