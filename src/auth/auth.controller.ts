import { LocalAuthGuard } from '@/auth/local-auth.guard';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@/auth/user.decorator';
import { UserWithoutPassword } from '@/user/entity/user.entity';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: UserWithoutPassword) {
    return user;
  }
}
