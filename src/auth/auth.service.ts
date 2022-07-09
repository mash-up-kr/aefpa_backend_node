import { AuthCodeType } from '@/auth/auth.types';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import { HashPassword } from '@/auth/hash-password';
import { JwtPayload } from '@/auth/jwt.types';
import { checkExists, checkNotExists } from '@/common/error-util';
import { RandomService } from '@/common/random.service';
import { PrismaService } from '@/prisma/prisma.service';
import { userWithoutPassword, UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashPassword: HashPassword,
    private prismaService: PrismaService,
    private randomService: RandomService,
    private mailerService: MailerService,
  ) {}

  async validate(email: string, pass: string): Promise<UserWithoutPassword> {
    const foundUser = checkExists(await this.userService.findUserByEmail(email));

    if (foundUser.password != null && !this.isValidPassword(foundUser.password, pass)) {
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
        // FIXME: nickname
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

  async generateAuthCode(email: string, type: AuthCodeType) {
    checkNotExists(await this.userService.findUserByEmail(email));

    const code = this.randomService.getRandomAuthCode(6);
    const expiredAt = moment().utc().add(10, 'minutes').format();

    await this.prismaService.userCode.create({
      data: {
        type,
        code,
        expiredAt,
        // FIXME: nickname
        user: { create: { email, nickname: '' } },
      },
    });

    this.mailerService.sendMail({
      to: email,
      subject: '[끼록] 이메일 인증 메일입니다 :)',
      // TODO: Template
      html: `
      <p>끼록에 오신 것을 환영해요! 아래 인증 코드를 끼록 앱에서 입력해주세요.</p>
      <p>인증 코드: <span>${code}</span></p>
      `,
    });

    return {
      email,
      expiredAt,
    };
  }

  async confirmAuthCode(email: string, type: AuthCodeType, code: string) {
    const user = checkExists(await this.userService.findUserByEmail(email));
    const userCode = checkExists(
      await this.prismaService.userCode.findFirst({
        where: {
          code,
          type,
          user,
          expiredAt: {
            gte: moment().utc().format(),
          },
        },
      }),
    );

    // Set expiredAt to current time (expired state)
    await this.prismaService.userCode.update({
      where: { id: userCode.id },
      data: { expiredAt: moment().utc().format() },
    });

    return true;
  }

  // debug purpose
  async deleteUser(email: string) {
    await this.prismaService.userCode.deleteMany({
      where: { user: { is: { email } } },
    });

    await this.prismaService.user.delete({ where: { email } });
  }
}
