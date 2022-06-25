import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { LocalStrategy } from '@/auth/local.strategy';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          // TODO: using environment variables
          secret: 'aefpa-secret',
          signOptions: {
            expiresIn: '60s',
          },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
