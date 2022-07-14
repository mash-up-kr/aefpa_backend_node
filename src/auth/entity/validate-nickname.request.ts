import { IsString, Length } from '@/validation';
import { NoSpecialCharacter } from '@/validation/no-special-character';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateNicknameRequest {
  @NoSpecialCharacter()
  @ApiProperty({ description: '닉네임' })
  @IsString()
  @Length(2, 10)
  nickname: string;
}
