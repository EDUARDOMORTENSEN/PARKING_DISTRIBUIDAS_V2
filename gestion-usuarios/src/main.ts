import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/usuarios');

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Gestión de Usuarios')
    .setDescription('API para la gestión de usuarios, personas, roles y asignación de roles del sistema de Parking')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/usuarios/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
