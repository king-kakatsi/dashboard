import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Stop the server right away if a secret is missing,
// instead of crashing later with a strange error.
function assertRequiredEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'MAIL_HOST',
    'MAIL_USER',
    'MAIL_PASS',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap() {
  assertRequiredEnv();
  const app = await NestFactory.create(AppModule);

  // Security headers for every response.
  app.use(helmet());
  app.use(cookieParser());
  // Reject unknown fields and convert types automatically.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Auth service listening on ${process.env.PORT ?? 3001}`);
}
bootstrap();
