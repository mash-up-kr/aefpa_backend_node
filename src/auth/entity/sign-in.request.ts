import { IsEmail, Length } from '@/validation';

export class SignInRequest {
  @IsEmail()
  email: string;

  @Length(8, 24)
  password: string;
}
