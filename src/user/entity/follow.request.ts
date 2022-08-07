import { IsNumber } from '@/validation';
import { ApiProperty } from '@nestjs/swagger';

export class FollowRequest {
  @IsNumber()
  @ApiProperty({
    description: '팔로우/언팔로우할 유저의 아이디',
  })
  id: number;
}
