import { AppModule } from '@/app.module';
import { AllExceptionFilter } from '@/common/all-exception.filter';
import { ResponseFormatInterceptor } from '@/common/response-format.interceptor';
import { PrismaService } from '@/prisma/prisma.service';
import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('port');

  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('kkilog API docs')
    .setDescription('끼록 API 문서')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        name: 'JWT',
        in: 'header',
      },
      'jwt',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const logger = new Logger('NestApplication');
  await app.listen(port, () => {
    logger.log(`Server is ready on port ${port}`);
  });
}
bootstrap();
