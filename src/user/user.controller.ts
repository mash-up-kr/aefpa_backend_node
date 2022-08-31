import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/auth/user.decorator';
import { ShortLogResponseDto } from '@/common/dto/response/short-log-response.dto';
import { FollowRequest } from '@/user/entity/follow.request';
import { FriendsListRequest } from '@/user/entity/friends-list.request';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '팔로우 하기' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post('friend/follow')
  async follow(@User() user: UserWithoutPassword, @Body() request: FollowRequest) {
    return await this.userService.follow(user.id, request.id);
  }

  @ApiOperation({ summary: '팔로우 취소' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post('friend/unfollow')
  async unfollow(@User() user: UserWithoutPassword, @Body() request: FollowRequest) {
    return await this.userService.unfollow(user.id, request.id);
  }

  @ApiOperation({ summary: '친구 목록 조회' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async friendsList(@User() user: UserWithoutPassword, @Query() request: FriendsListRequest) {
    return await this.userService.getFriendsList(user.id, request.type, request.keyword);
  }

  @ApiOperation({ summary: '유저 정보 조회' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getUserProfile(@User() user: UserWithoutPassword) {
    return await this.userService.getUserProfileWithFollows(user.id);
  }

  @ApiOperation({ summary: '유저 삭제' })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Delete('')
  async deleteUser(@User() user: UserWithoutPassword) {
    return await this.userService.deleteUser(user.id);
  }

  @ApiOperation({ summary: '유저의 전체 끼록 조회' })
  @ApiOkResponse({
    description: '성공',
    type: ShortLogResponseDto,
    isArray: true,
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Get('/logs/:userId')
  async getLogs(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userService.findAllLogsByUserId(userId);
  }
}
