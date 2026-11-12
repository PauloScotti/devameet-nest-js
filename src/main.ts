import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupOpenApi } from './docs/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'warn'],
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  setupOpenApi(app);

  await app.listen(process.env.SERVER_PORT || 3000);
}
bootstrap();
