import { AuthService } from '@/auth/auth.service';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserWithoutPassword> {
    return await this.authService.validate(email, password);
  }
}
