import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserWithoutPassword } from 'src/user/entity/user.entity';

// 유저 정보를 가져오는 데코레이터입니다.
// `@Req() req` 대신 사용하세요.
export const User = createParamDecorator<any, any, UserWithoutPassword>(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as UserWithoutPassword;
  },
);
