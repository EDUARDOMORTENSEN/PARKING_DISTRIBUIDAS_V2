import { AsignacionVehiculo } from '../entities/asignacion-vehiculo.entity';

/**
 * Eventos de dominio emitidos por AsignacionesService.
 * El módulo de auditoría los escucha de forma desacoplada mediante @OnEvent().
 * El módulo de asignaciones NO necesita importar el módulo de auditoría.
 */

/** Emitido justo después de persistir una nueva asignación */
export class AsignacionCreatedEvent {
  constructor(public readonly asignacion: AsignacionVehiculo) {}
}

/** Emitido justo después de modificar una asignación existente */
export class AsignacionUpdatedEvent {
  constructor(
    public readonly asignacionAnterior: AsignacionVehiculo,
    public readonly asignacionNueva: AsignacionVehiculo,
  ) {}
}

/** Emitido justo después de dar de baja (baja lógica) una asignación */
export class AsignacionDeletedEvent {
  constructor(public readonly asignacion: AsignacionVehiculo) {}
}
