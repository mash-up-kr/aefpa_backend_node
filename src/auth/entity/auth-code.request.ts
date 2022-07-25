import { AuthCodeType, authCodeTypes } from '@/auth/auth.types';
import { IsEmail, IsIn } from '@/validation';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCodeRequest {
  @IsEmail()
  @ApiProperty({ description: '이메일' })
  email: string;

  @IsIn(authCodeTypes)
  @ApiProperty({ type: String, description: '인증 코드 타입' })
  type: AuthCodeType;
}
