import { AuthService } from '@/auth/auth.service';
import { SignInRequest } from '@/auth/entity/sign-in.request';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { User } from '@/auth/user.decorator';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { SignUpDto } from '@/auth/dto/sign-up.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: SignInRequest })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: UserWithoutPassword) {
    return {
      accessToken: await this.authService.createJwtFromUser(user),
    };
  }
  // FIXME: test code

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('test')
  async test(@User() user: UserWithoutPassword) {
    return user;
  }

  @ApiOperation({ summary: '회원가입' })
  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }
}
