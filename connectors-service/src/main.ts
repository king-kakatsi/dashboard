import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Auth service listening on ${process.env.PORT ?? 3001}`);
}
bootstrap();
