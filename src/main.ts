import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpZodValidationPipe } from './common/pipes/zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'warn'],
  });

  app.enableCors();

  app.useGlobalPipes(new HttpZodValidationPipe());

  app.setGlobalPrefix('api');

  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('Devameet API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.use('/api/docs', apiReference({ content: document }));

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
