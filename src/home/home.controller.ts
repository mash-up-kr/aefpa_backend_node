import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { HomeStatusResponse } from '@/home/dto/home-character.response';
import { HomeFriendsResponse } from '@/home/dto/home-friends.response';
import { HomeService } from '@/home/home.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @ApiOperation({
    summary: '홈 상태 정보 조회',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@User() user: UserWithoutPassword): Promise<HomeStatusResponse> {
    return await this.homeService.getCharacterStatus(user.id);
  }

  @ApiOperation({
    summary: '홈 친구 목록 조회',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async getFriendsList(@User() user: UserWithoutPassword): Promise<HomeFriendsResponse> {
    return await this.homeService.getFriends(user.id);
  }
}
