import { IsEmail, Length } from 'class-validator';

export class SignInRequest {
  @IsEmail()
  email: string;

  @Length(8, 24)
  password: string;
}
