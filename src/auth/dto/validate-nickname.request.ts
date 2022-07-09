import { ErrorMessages } from '@/common/error-messages';
import { NoSpecialCharacter } from '@/validation/no-special-character';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidateNicknameRequest {
  @NoSpecialCharacter()
  @ApiProperty({ description: '닉네임' })
  @IsString({ message: ErrorMessages.invalidFormat() })
  @Length(2, 10, { message: ErrorMessages.invalidLength })
  nickname: string;
}
