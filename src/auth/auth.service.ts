import { User } from '@/api/server/generated';
import { AuthCodeType } from '@/auth/auth.types';
import { SignUpRequest } from '@/auth/dto/sign-up.request';
import { HashPassword } from '@/auth/hash-password';
import { JwtPayload } from '@/auth/jwt.types';
import { RandomCharacterService } from '@/character/random.character.service';
import { ErrorMessages } from '@/common/error-messages';
import { checkExists, checkNotExists } from '@/common/error-util';
import { RandomService } from '@/common/random.service';
import { PrismaService } from '@/prisma/prisma.service';
import { userWithoutPassword, UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    private randomCharacterService: RandomCharacterService,
    private mailerService: MailerService,
  ) {}

  async validate(email: string, pass: string): Promise<UserWithoutPassword> {
    const foundUser = checkExists(await this.userService.findUserByEmail(email), 'email');

    // sign up in progress
    if (!this.isUserExistsAndConfirmed(foundUser)) {
      throw new NotFoundException(ErrorMessages.notFound('email'));
    }

    if (foundUser.password != null && !this.isValidPassword(foundUser.password, pass)) {
      throw new UnauthorizedException(ErrorMessages.incorrect('password'));
    }

    return userWithoutPassword(foundUser);
  }

  async signup({ email, nickname, password }: SignUpRequest) {
    const foundUser = await this.prismaService.user.findFirst({
      where: { email },
      include: {
        userCode: {
          where: {
            type: 'SIGN_UP',
            NOT: { confirmedAt: null },
          },
        },
      },
    });

    if (this.isUserExistsAndConfirmed(foundUser)) {
      throw new BadRequestException(ErrorMessages.alreadyExists('email'));
    }

    const codes = foundUser?.userCode ?? [];
    if (codes.length === 0 || !codes[0].confirmedAt) {
      throw new ForbiddenException('Email confirmation is required.');
    }

    const user = await this.prismaService.user.update({
      where: {
        email,
      },
      include: { userCharacter: true },
      data: {
        email,
        password: await this.hashPassword.hash(password),
        userProfile: {
          create: {
            nickname,
          },
        },
        userCharacter: {
          create: {
            characterType: this.randomCharacterService.getRandomCharacter(),
          },
        },
      },
    });

    const token = await this.createJwtFromUser(user);

    return {
      user: userWithoutPassword(user),
      character: user.userCharacter!.characterType,
      token,
    };
  }

  async validateUserEmail(email: string): Promise<boolean> {
    return !this.isUserExistsAndConfirmed(await this.userService.findUserByEmail(email));
  }

  private isValidPassword(original: string, target: string) {
    // TODO: Use encryption library
    return this.hashPassword.equal({ password: target, hashPassword: original });
  }

  async createJwtFromUser(user: UserWithoutPassword) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return await this.jwtService.signAsync(payload);
  }

  async generateAuthCode(email: string, type: AuthCodeType) {
    const foundUser = await this.userService.findUserByEmail(email);

    if (this.isUserExistsAndConfirmed(foundUser)) {
      throw new ConflictException(ErrorMessages.alreadyExists('email'));
    }

    // Let the previous auth codes to be expired
    await this.prismaService.userCode.updateMany({
      where: { userId: foundUser?.id },
      data: { expiredAt: moment().utc().format() },
    });

    const code = this.randomService.getRandomAuthCode(6);
    const expiredAt = moment().utc().add(10, 'minutes').format();

    await this.prismaService.userCode.create({
      data: {
        type,
        code,
        expiredAt,
        user: {
          connectOrCreate: {
            create: { email },
            where: { email },
          },
        },
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
    const user = checkExists(await this.userService.findUserByEmail(email), 'email');
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
      'userCode',
    );

    // Set expiredAt to current time (expired state)
    await this.prismaService.userCode.update({
      where: { id: userCode.id },
      data: {
        expiredAt: moment().utc().format(),
        confirmedAt: moment().utc().format(),
      },
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

  async validateEmail(email: string) {
    // 0. Check if email is valid format (done with class validator)
    // 1. Check if the email is unique
    // 2. Check if the user is not confirmed
    const foundUser = await this.prismaService.user.findUnique({ where: { email } });
    if (this.isUserExistsAndConfirmed(foundUser)) {
      throw new ConflictException(ErrorMessages.alreadyExists('email'));
    }
    return true;
  }

  private isUserExistsAndConfirmed(user: User | null) {
    return user && user.password != null;
  }

  async validateNickname(nickname: string) {
    // 0. Check if nickname is valid format (done with class validator)
    // 1. Check if the nickname is unique
    checkNotExists(
      await this.prismaService.userProfile.findUnique({ where: { nickname } }),
      'nickname',
    );
    return true;
  }
}
