import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';

import { AsignacionVehiculo } from './asignaciones/entities/asignacion-vehiculo.entity';
import { AuditoriaAsignacion } from './auditoria/entities/auditoria-asignacion.entity';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // EventEmitter — necesario para el patrón Evento de Dominio (auditoría)
    EventEmitterModule.forRoot({
      // Usar wildcard para escuchar 'asignacion.*'
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),

    // TypeORM — base de datos propia del microservicio
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USUARIO'),
        password: configService.get<string>('DB_CONTRASENA'),
        database: configService.get<string>('DB_NOMBRE'),
        entities: [AsignacionVehiculo, AuditoriaAsignacion],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // Módulos de dominio
    AuthModule,
    AsignacionesModule,
    AuditoriaModule,
    AuditModule,
  ],
})
export class AppModule {}
