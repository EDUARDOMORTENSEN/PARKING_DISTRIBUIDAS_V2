import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditoriaService } from '../auditoria.service';
import { TipoAccion } from '../entities/auditoria-asignacion.entity';
import {
  AsignacionCreatedEvent,
  AsignacionDeletedEvent,
  AsignacionUpdatedEvent,
} from '../../asignaciones/events/asignacion.events';

/**
 * RF2 — Listener de auditoría desacoplado mediante el patrón Evento de Dominio.
 *
 * Este listener NO es importado por el módulo de asignaciones.
 * Escucha eventos publicados via EventEmitter2 y delega al AuditoriaService
 * la persistencia del registro de trazabilidad.
 *
 * Patrón: Publicador/Suscriptor (pub/sub) intra-proceso.
 * El módulo de asignaciones no conoce la existencia de este listener.
 */
@Injectable()
export class AuditoriaListener {
  private readonly logger = new Logger(AuditoriaListener.name);

  constructor(private readonly auditoriaService: AuditoriaService) {}

  /**
   * Reacciona a la creación de una asignación.
   * payloadAnterior = null (no había estado previo).
   * payloadNuevo = snapshot de la asignación creada.
   */
  @OnEvent('asignacion.created', { async: true })
  async handleAsignacionCreated(event: AsignacionCreatedEvent): Promise<void> {
    try {
      await this.auditoriaService.registrar(
        event.asignacion.userId,
        event.asignacion.vehicleId,
        TipoAccion.CREACION,
        null,
        {
          userId: event.asignacion.userId,
          vehicleId: event.asignacion.vehicleId,
          activa: event.asignacion.activa,
          notas: event.asignacion.notas,
          fechaAsignacion: event.asignacion.fechaAsignacion,
        },
      );
    } catch (error) {
      // El error de auditoría no debe interrumpir el flujo principal
      this.logger.error(
        `Error al registrar auditoría de CREACION: ${error?.message}`,
        error?.stack,
      );
    }
  }

  /**
   * Reacciona a la modificación de una asignación.
   * payloadAnterior = estado antes del cambio.
   * payloadNuevo = estado después del cambio.
   */
  @OnEvent('asignacion.updated', { async: true })
  async handleAsignacionUpdated(event: AsignacionUpdatedEvent): Promise<void> {
    try {
      await this.auditoriaService.registrar(
        event.asignacionNueva.userId,
        event.asignacionNueva.vehicleId,
        TipoAccion.MODIFICACION,
        {
          userId: event.asignacionAnterior.userId,
          vehicleId: event.asignacionAnterior.vehicleId,
          activa: event.asignacionAnterior.activa,
          notas: event.asignacionAnterior.notas,
          fechaActualizacion: event.asignacionAnterior.fechaActualizacion,
        },
        {
          userId: event.asignacionNueva.userId,
          vehicleId: event.asignacionNueva.vehicleId,
          activa: event.asignacionNueva.activa,
          notas: event.asignacionNueva.notas,
          fechaActualizacion: event.asignacionNueva.fechaActualizacion,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error al registrar auditoría de MODIFICACION: ${error?.message}`,
        error?.stack,
      );
    }
  }

  /**
   * Reacciona a la baja lógica de una asignación.
   * payloadAnterior = estado de la asignación antes de ser desactivada.
   * payloadNuevo = null (el recurso fue dado de baja).
   */
  @OnEvent('asignacion.deleted', { async: true })
  async handleAsignacionDeleted(event: AsignacionDeletedEvent): Promise<void> {
    try {
      await this.auditoriaService.registrar(
        event.asignacion.userId,
        event.asignacion.vehicleId,
        TipoAccion.ELIMINACION,
        {
          userId: event.asignacion.userId,
          vehicleId: event.asignacion.vehicleId,
          activa: true, // era activa antes de ser desactivada
          notas: event.asignacion.notas,
        },
        null,
      );
    } catch (error) {
      this.logger.error(
        `Error al registrar auditoría de ELIMINACION: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
