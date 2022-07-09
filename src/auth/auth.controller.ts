import { AuthService } from '@/auth/auth.service';
import { AuthCodeConfirmRequest } from '@/auth/entity/auth-code-confirm.request';
import { AuthCodeRequest } from '@/auth/entity/auth-code.request';
import { SignInRequest } from '@/auth/entity/sign-in.request';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { User } from '@/auth/user.decorator';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

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

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('test')
  async test(@User() user: UserWithoutPassword) {
    return user;
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
}
