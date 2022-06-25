import { Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { User } from 'src/auth/user.decorator';
import { UserWithoutPassword } from 'src/user/entity/user.entity';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: UserWithoutPassword) {
    return user;
  }
}
