import { JwtPayload } from '@/auth/jwt.types';
import { PrismaService } from '@/prisma/prisma.service';
import { userWithoutPassword, UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import { hashPassword } from '@/auth/hash-password';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashPassword: hashPassword,
    private prismaService: PrismaService,
  ) { }

  async validate(email: string, pass: string): Promise<UserWithoutPassword> {
    const foundUser = await this.userService.findUserByEmail(email);

    if (!this.isValidPassword(foundUser.password, pass)) {
      throw new UnauthorizedException(`Password is incorrect.`);
    }

    return userWithoutPassword(foundUser);
  }

  async signup({ email, nickname, password }: SignUpDto) {
    const foundUser = await this.userService.findUserByEmail(email);
    if (foundUser) {
      throw new BadRequestException(`Email is already exists`);
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        nickname,
        password: await this.hashPassword.hash(password),
      },
    });

    const token = await this.createJwtFromUser(user);

    return {
      user,
      token,
    };
  }

  async validateUserEmail(email: string): Promise<boolean> {
    const foundUser = await this.userService.findUserByEmail(email);
    if (foundUser) {
      return false;
    }
    return true;
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
}
