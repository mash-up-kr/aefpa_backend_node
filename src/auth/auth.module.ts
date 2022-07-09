import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { HashPassword } from '@/auth/hash-password';
import { JwtAuthStrategy } from '@/auth/jwt.strategy';
import { LocalStrategy } from '@/auth/local.strategy';
import { RandomService } from '@/common/random.service';
import { PrismaModule } from '@/prisma/prisma.module';
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
    PrismaModule,
  ],
  providers: [
    RandomService.withPool(),
    AuthService,
    LocalStrategy,
    JwtAuthStrategy,
    HashPassword,
    PrismaService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
