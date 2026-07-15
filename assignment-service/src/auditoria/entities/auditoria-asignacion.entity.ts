import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tipos de acción de auditoría según RF2.
 */
export enum TipoAccion {
  CREACION = 'CREACION',
  MODIFICACION = 'MODIFICACION',
  ELIMINACION = 'ELIMINACION',
}

/**
 * RF2 — Entidad de trazabilidad/auditoría de asignaciones.
 *
 * Colección separada de `asignaciones_vehiculos`.
 * Cada operación CRUD en asignaciones genera automáticamente
 * un registro aquí vía el patrón Evento de Dominio + Listener.
 *
 * Esta entidad NUNCA se modifica ni elimina una vez creada
 * (principio de inmutabilidad del log de auditoría).
 */
@Entity('auditoria_asignaciones')
export class AuditoriaAsignacion {
  /** Identificador único del evento de auditoría */
  @ApiProperty({
    description: 'ID único del evento de auditoría',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** user_id de la clave compuesta afectada */
  @ApiProperty({
    description: 'user_id de la clave compuesta afectada',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  /** vehicle_id de la clave compuesta afectada */
  @ApiProperty({
    description: 'vehicle_id de la clave compuesta afectada',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid', name: 'vehicle_id' })
  vehicleId!: string;

  /** Tipo de operación realizada sobre la asignación */
  @ApiProperty({
    description: 'Tipo de acción auditada',
    enum: TipoAccion,
    example: TipoAccion.CREACION,
  })
  @Column({ type: 'enum', enum: TipoAccion })
  accion!: TipoAccion;

  /** Timestamp exacto con zona horaria del momento del evento */
  @ApiProperty({
    description: 'Timestamp exacto del evento con zona horaria',
    example: '2026-01-15T10:30:00.000-05:00',
  })
  @Column({ type: 'timestamptz' })
  timestamp!: Date;

  /**
   * Estado de la asignación ANTES del cambio.
   * null en eventos CREACION (no había estado previo).
   */
  @ApiProperty({
    description: 'Payload del estado anterior (null para CREACION)',
    nullable: true,
    example: { activa: true, notas: 'Vehículo anterior' },
  })
  @Column({ type: 'jsonb', nullable: true, name: 'payload_anterior' })
  payloadAnterior!: object | null;

  /**
   * Estado de la asignación DESPUÉS del cambio.
   * null en eventos ELIMINACION (el recurso fue borrado).
   */
  @ApiProperty({
    description: 'Payload del estado nuevo (null para ELIMINACION)',
    nullable: true,
    example: { activa: true, notas: 'Vehículo actualizado' },
  })
  @Column({ type: 'jsonb', nullable: true, name: 'payload_nuevo' })
  payloadNuevo!: object | null;
}
