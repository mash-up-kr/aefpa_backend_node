import { IsEmail, IsString, Length } from '@/validation';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequest {
  @IsEmail()
  @ApiProperty({ description: '이메일' })
  email: string;

  @IsString()
  @Length(8, 24, '$property')
  @ApiProperty({ description: '새로운 패스워드' })
  newPassword: string;

  @IsString()
  @Length(8, 24, '$property')
  @ApiProperty({ description: '패스워드 확인' })
  confirmPassword: string;
}
