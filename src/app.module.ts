import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { LogModule } from '@/log/log.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserModule } from '@/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config';
import { ImageModule } from './image/image.module';
import { S3Module } from './s3/s3.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    LogModule,
    UserModule,
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
              user: config.get('mail.user'),
              pass: config.get('mail.password'),
            },
          },
          defaults: {
            from: `"끼록" <${config.get('mail.user')}>`,
          },
        };
      },
    }),
    ImageModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
