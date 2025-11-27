import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // mensagem clara no console conforme solicitado
  // inclui host mesmo que seja 0.0.0.0 em alguns ambientes
  console.log(`API rodando em http://localhost:${port}`);
}

bootstrap();
