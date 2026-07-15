import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaListener } from './listeners/auditoria.listener';
import { AuditoriaAsignacion } from './entities/auditoria-asignacion.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de auditoría completamente desacoplado del módulo de asignaciones.
 * El AuditoriaListener reacciona a eventos de dominio emitidos por EventEmitter2
 * sin que AsignacionesModule necesite importar AuditoriaModule.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditoriaAsignacion]),
    AuthModule,
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditoriaListener],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
