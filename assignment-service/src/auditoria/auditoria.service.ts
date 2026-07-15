import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditoriaAsignacion,
  TipoAccion,
} from './entities/auditoria-asignacion.entity';

/**
 * Servicio de auditoría responsable de persistir eventos de trazabilidad.
 * Es llamado exclusivamente por AuditoriaListener, no por el módulo de asignaciones.
 */
@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(AuditoriaAsignacion)
    private readonly auditoriaRepo: Repository<AuditoriaAsignacion>,
  ) {}

  /**
   * Persiste un registro de auditoría en la tabla separada.
   */
  async registrar(
    userId: string,
    vehicleId: string,
    accion: TipoAccion,
    payloadAnterior: object | null,
    payloadNuevo: object | null,
  ): Promise<AuditoriaAsignacion> {
    const registro = this.auditoriaRepo.create({
      userId,
      vehicleId,
      accion,
      timestamp: new Date(),
      payloadAnterior,
      payloadNuevo,
    });
    const guardado = await this.auditoriaRepo.save(registro);
    this.logger.log(
      `Auditoría registrada: accion=${accion} user=${userId} vehicle=${vehicleId} id=${guardado.id}`,
    );
    return guardado;
  }

  /**
   * Retorna todos los registros de auditoría ordenados por timestamp descendente.
   */
  async findAll(): Promise<AuditoriaAsignacion[]> {
    return this.auditoriaRepo.find({
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Retorna el historial de auditoría de una clave compuesta específica.
   */
  async findByClaveCompuesta(
    userId: string,
    vehicleId: string,
  ): Promise<AuditoriaAsignacion[]> {
    return this.auditoriaRepo.find({
      where: { userId, vehicleId },
      order: { timestamp: 'DESC' },
    });
  }
}
