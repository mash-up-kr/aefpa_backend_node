import { JwtPayload } from '@/auth/jwt.types';
import { UserWithoutPassword } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  /**
   * validate()의 역할은 아무 것도 없음
   * -> payload에 있는 email 정보로 유저 정보를 찾아서 내려주는 것 뿐
   */
  async validate(payload: JwtPayload): Promise<UserWithoutPassword> {
    return await this.userService.findUserByEmail(payload.email);
  }
}
