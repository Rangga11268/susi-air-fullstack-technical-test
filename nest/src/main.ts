import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_CONFIG } from './config/app.config';

let cachedApp: INestApplication | null = null;

async function createConfiguredApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  cachedApp = app;
  return app;
}

async function bootstrap() {
  const app = await createConfiguredApp();
  await app.listen(APP_CONFIG.port);
  console.log(
    `Susi Air API listening on port ${APP_CONFIG.port} with APP_TODAY=${APP_CONFIG.today}`,
  );
}

if (!process.env.VERCEL) {
  bootstrap();
}

export default async function handler(req: any, res: any) {
  const app = await createConfiguredApp();
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
}
