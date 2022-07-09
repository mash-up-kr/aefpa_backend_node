import { AuthCodeType, authCodeTypes } from '@/auth/auth.types';
import { ErrorMessages } from '@/common/error-messages';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn } from 'class-validator';

export class AuthCodeRequest {
  @IsEmail(undefined, {
    message: ErrorMessages.invalidFormat(),
  })
  @ApiProperty({ description: '이메일' })
  email: string;

  @IsIn(authCodeTypes, {
    message: ErrorMessages.invalidFormat('$constraint1'),
  })
  @ApiProperty({ type: String, description: '인증 코드 타입' })
  type: AuthCodeType;
}
