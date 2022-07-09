import { AuthCodeRequest } from '@/auth/dto/auth-code.request';
import { ErrorMessages } from '@/common/error-messages';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class AuthCodeConfirmRequest extends AuthCodeRequest {
  @IsString({ message: ErrorMessages.invalidFormat() })
  @Length(6, 6, { message: ErrorMessages.invalidFormat() })
  @ApiProperty({ description: '인증 코드' })
  code: string;
}
