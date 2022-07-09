import { AuthService } from '@/auth/auth.service';
import { AuthCodeConfirmRequest } from '@/auth/entity/auth-code-confirm.request';
import { AuthCodeRequest } from '@/auth/entity/auth-code.request';
import { SignInRequest } from '@/auth/entity/sign-in.request';
import { ValidateEmailRequest } from '@/auth/entity/validate-email.request';
import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { User } from '@/auth/user.decorator';
import { UserWithoutPassword } from '@/user/entity/user.entity';
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

  @ApiOperation({ summary: '인증 코드 발송' })
  @Post('/code')
  async generateAuthCode(@Body() { email, type }: AuthCodeRequest) {
    return await this.authService.generateAuthCode(email, type);
  }

  @ApiOperation({ summary: '인증 코드 확인' })
  @Post('/code/check')
  async confirmAuthCode(@Body() { email, type, code }: AuthCodeConfirmRequest) {
    return await this.authService.confirmAuthCode(email, type, code);
  }

  @ApiOperation({ summary: '유저 삭제 (디버깅용)' })
  @Delete('/user')
  async deleteUser(@Query('email') email: string) {
    await this.authService.deleteUser(email);
  }

  @ApiOperation({ summary: '이메일 중복 체크' })
  @ApiBadRequestResponse({ description: '이메일이 잘못되었습니다.' })
  @ApiConflictResponse({ description: '이메일이 이미 사용중입니다.' })
  @Get('/validate/email')
  async validateEmail(@Query() { email }: ValidateEmailRequest) {
    return await this.authService.validateEmail(email);
  }
}
