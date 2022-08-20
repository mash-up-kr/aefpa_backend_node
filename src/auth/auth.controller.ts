import { AuthService } from '@/auth/auth.service';
import { ResetPasswordRequest } from '@/auth/dto/reset-password.request';
import { SignUpRequest } from '@/auth/dto/sign-up.request';
import { SignUpResponse } from '@/auth/dto/sign-up.response';
import { AuthCodeConfirmRequest } from '@/auth/entity/auth-code-confirm.request';
import { AuthCodeRequest } from '@/auth/entity/auth-code.request';
import { SignInRequest } from '@/auth/entity/sign-in.request';
import { ValidateEmailRequest } from '@/auth/entity/validate-email.request';
import { ValidateNicknameRequest } from '@/auth/entity/validate-nickname.request';
import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { User } from '@/auth/user.decorator';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: SignInRequest })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: UserWithoutPassword) {
    return {
      accessToken: await this.authService.createJwtFromUser(user),
    };
  }

  @ApiOperation({ summary: '회원가입' })
  @Post('signup')
  async signup(@Body() dto: SignUpRequest): Promise<SignUpResponse> {
    return customPlainToInstance(SignUpResponse, await this.authService.signup(dto));
  }

  @ApiOperation({ summary: '인증 코드 발송' })
  @Post('code')
  async generateAuthCode(@Body() { email, type }: AuthCodeRequest) {
    return await this.authService.generateAuthCode(email, type);
  }

  @ApiOperation({ summary: '인증 코드 확인' })
  @Post('code/check')
  async confirmAuthCode(@Body() { email, type, code }: AuthCodeConfirmRequest) {
    return await this.authService.confirmAuthCode(email, type, code);
  }

  @ApiOperation({ summary: '유저 삭제 (디버깅용)' })
  @Delete('user')
  async deleteUser(@Query('email') email: string) {
    await this.authService.deleteUser(email);
  }

  @ApiOperation({ summary: '이메일 중복 체크' })
  @ApiBadRequestResponse({ description: '이메일이 잘못되었습니다.' })
  @ApiConflictResponse({ description: '이메일이 이미 사용중입니다.' })
  @Get('validate/email')
  async validateEmail(@Query() { email }: ValidateEmailRequest) {
    return await this.authService.validateEmail(email);
  }

  @ApiOperation({ summary: '닉네임 중복 체크' })
  @ApiBadRequestResponse({ description: '닉네임이 잘못되었습니다.' })
  @ApiConflictResponse({ description: '닉네임이 이미 사용중입니다.' })
  @Get('validate/nickname')
  async validateNickname(@Query() { nickname }: ValidateNicknameRequest) {
    return await this.authService.validateNickname(nickname);
  }

  @ApiOperation({ summary: '패스워드 리셋' })
  @ApiBadRequestResponse({ description: '패스워드 확인 실패' })
  @Post('password/reset')
  async resetPassword(@Body() { email, newPassword, confirmPassword }: ResetPasswordRequest) {
    return await this.authService.resetPassword(email, newPassword, confirmPassword);
  }
}
