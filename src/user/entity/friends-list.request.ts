import { FriendType, friendTypes } from '@/user/user.types';
import { IsIn, IsOptional, IsString } from '@/validation';
import { ApiProperty } from '@nestjs/swagger';

export class FriendsListRequest {
  @ApiProperty({
    type: String,
    description: '팔로워/팔로잉 타입 여부',
  })
  @IsIn(friendTypes)
  type: FriendType;

  @ApiProperty({
    required: false,
    description: '친구 닉네임 검색 키워드',
  })
  @IsString()
  @IsOptional()
  keyword: string;
}
