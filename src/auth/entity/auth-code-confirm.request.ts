import { AuthCodeRequest } from '@/auth/entity/auth-code.request';
import { IsString, Length } from '@/validation';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCodeConfirmRequest extends AuthCodeRequest {
  @IsString()
  @Length(6, 6)
  @ApiProperty({ description: '인증 코드' })
  code: string;
}
