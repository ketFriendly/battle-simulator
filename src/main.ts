import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  config();
  console.log(
    `The process is running on ${process.env.ENV || 'development'} server`,
  );
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
