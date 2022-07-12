import { ErrorMessages } from '@/common/error-messages';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ValidateEmailRequest {
  @IsEmail(undefined, {
    message: ErrorMessages.invalidFormat(),
  })
  @ApiProperty({ description: '이메일' })
  email: string;
}
