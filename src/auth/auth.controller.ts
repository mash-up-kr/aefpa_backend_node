import { AuthService } from '@/auth/auth.service';
import { AuthCodeRequest } from '@/auth/entity/auth-code.request';
import { SignInRequest } from '@/auth/entity/sign-in.request';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { User } from '@/auth/user.decorator';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
