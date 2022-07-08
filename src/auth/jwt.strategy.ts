import { JwtPayload } from '@/auth/jwt.types';
import { userWithoutPassword, UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'aefpa-secret',
    });
  }

  /**
   * validate()의 역할은 아무 것도 없음
   * -> payload에 있는 email 정보로 유저 정보를 찾아서 내려주는 것 뿐
   */
  async validate(payload: JwtPayload): Promise<UserWithoutPassword> {
    return userWithoutPassword(await this.userService.findUserByEmail(payload.email));
  }
}
