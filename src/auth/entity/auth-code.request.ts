import { AuthCodeType, authCodeTypes } from '@/auth/auth.types';
import { ErrorMessages } from '@/common/error-messages';
import { IsEmail, IsIn } from 'class-validator';

export class AuthCodeRequest {
  @IsEmail(undefined, {
    message: ErrorMessages.invalidFormat(),
  })
  email: string;

  @IsIn(authCodeTypes, {
    message: ErrorMessages.invalidFormat('$constraint1'),
  })
  type: AuthCodeType;
}
