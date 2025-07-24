import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './common/filter/http-exception.filter';
import { PrismaExceptionFilter } from './common/filter/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // use NestExpressApplication

  // global route prefix
  app.setGlobalPrefix('api');

  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  setupSwagger(app);

  // global exception filters
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
