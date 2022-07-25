import { IsEmail } from '@/validation';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateEmailRequest {
  @IsEmail()
  @ApiProperty({ description: '이메일' })
  email: string;
}
