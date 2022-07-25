import { IsEmail, IsString, Length } from '@/validation';
import { NoSpecialCharacter } from '@/validation/no-special-character';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpRequest {
  @IsEmail()
  @ApiProperty({ description: '이메일' })
  email: string;

  @IsString()
  @Length(8, 24, '$property')
  @ApiProperty({ description: '패스워드' })
  password: string;

  @IsString()
  @NoSpecialCharacter('$property')
  @Length(2, 10, '$property')
  @ApiProperty({ description: '닉네임' })
  nickname: string;
}
