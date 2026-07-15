import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Pipe de validación global (class-validator + class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración Swagger
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Assignment Service')
    .setDescription(
      'Microservicio de Asignación de Vehículos y Trazabilidad (Auditoría). ' +
      'Gestiona la relación propietario ↔ vehículo con clave compuesta y ' +
      'registro automático de eventos de trazabilidad.',
    )
    .setVersion('1.0')
    .build();

  const docs = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/asignaciones/docs', app, docs);

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`Assignment Service corriendo en puerto ${port}`);
}
bootstrap();
