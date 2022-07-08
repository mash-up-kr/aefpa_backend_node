import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // TODO: Use config service
  const port = process.env['PORT'] ?? 3000;

  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
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
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
bootstrap();
