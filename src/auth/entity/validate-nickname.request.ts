import { ErrorMessages } from '@/common/error-messages';
import { NoSpecialCharacter } from '@/validation/no-special-character';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateNicknameRequest {
  @NoSpecialCharacter()
  @ApiProperty({ description: '닉네임' })
  @IsString({ message: ErrorMessages.invalidFormat() })
  @IsNotEmpty({ message: ErrorMessages.invalidFormat() })
  nickname: string;
}
