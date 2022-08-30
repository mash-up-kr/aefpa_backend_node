import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { HomeStatusResponse } from '@/home/dto/home-character.response';
import { HomeService } from '@/home/home.service';
import { UserResponse } from '@/user/entity/user.dto';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @ApiOperation({
    summary: '친구 상태 정보 조회',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('status/:userId')
  async getFriendStatus(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<HomeStatusResponse> {
    return await this.homeService.getCharacterStatus(userId);
  }

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
  async getFriendsList(@User() user: UserWithoutPassword): Promise<UserResponse[]> {
    return await this.homeService.getFriends(user.id);
  }

  @ApiOperation({
    summary: '캐릭터 레벨 업',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post('level-up')
  async levelUpCharacter(@User() user: UserWithoutPassword): Promise<boolean> {
    return await this.homeService.levelUpCharacter(user.id);
  }
}
