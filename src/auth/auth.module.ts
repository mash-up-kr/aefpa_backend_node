import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { hashPassword } from '@/auth/hash-password';
import { JwtAuthStrategy } from '@/auth/jwt.strategy';
import { LocalStrategy } from '@/auth/local.strategy';
import { PrismaService } from '@/prisma/prisma.service';
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
  providers: [AuthService, LocalStrategy, JwtAuthStrategy, hashPassword, PrismaService],
  controllers: [AuthController],
})
export class AuthModule { }
