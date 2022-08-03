import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { HomeCharacterResponse } from '@/home/dto/home-character.response';
import { HomeService } from '@/home/home.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { customPlainToInstance } from '@/util/plain-to-instance';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @ApiOperation({
    summary: '홈 캐릭터 정보 조회',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('character/status')
  async getCharacterStatus(@User() user: UserWithoutPassword): Promise<HomeCharacterResponse> {
    return customPlainToInstance(
      HomeCharacterResponse,
      await this.homeService.getCharacterStatus(user.id),
    );
  }
}
