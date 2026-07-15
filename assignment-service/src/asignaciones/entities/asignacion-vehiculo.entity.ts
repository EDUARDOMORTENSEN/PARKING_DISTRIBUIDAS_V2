import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * RF1 — Entidad de asignación de vehículo a propietario.
 *
 * Clave compuesta obligatoria: (user_id, vehicle_id).
 * Un vehículo solo puede tener una asignación activa a la vez
 * (validado en la capa de servicio antes de persistir).
 *
 * Nota: Los IDs apuntan a entidades de otros microservicios;
 * NO son foreign keys de base de datos (bases de datos separadas).
 * La validación de existencia se realiza vía HTTP en el servicio.
 */
@Entity('asignaciones_vehiculos')
export class AsignacionVehiculo {
  /** Identificador del propietario — referencia UUID al microservicio gestion-usuarios */
  @ApiProperty({
    description: 'UUID del propietario (referencia a gestion-usuarios)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  /** Identificador del vehículo — referencia UUID al microservicio de vehículos */
  @ApiProperty({
    description: 'UUID del vehículo (referencia a vehiculos-service)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn({ type: 'uuid', name: 'vehicle_id' })
  vehicleId!: string;

  /** Indica si la asignación está actualmente vigente */
  @ApiProperty({
    description: 'Estado de la asignación. false = dada de baja lógicamente.',
    example: true,
  })
  @Column({ default: true })
  activa!: boolean;

  /** Timestamp con zona horaria de cuando se creó la asignación */
  @ApiProperty({
    description: 'Fecha y hora de creación de la asignación (con timezone)',
    example: '2026-01-15T10:30:00.000-05:00',
  })
  @CreateDateColumn({ type: 'timestamptz', name: 'fecha_asignacion' })
  fechaAsignacion!: Date;

  /** Timestamp con zona horaria de la última modificación */
  @ApiProperty({
    description: 'Fecha y hora de la última actualización (con timezone)',
    example: '2026-01-20T14:00:00.000-05:00',
  })
  @UpdateDateColumn({ type: 'timestamptz', name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  /** Campo libre para observaciones adicionales sobre la asignación */
  @ApiProperty({
    description: 'Notas u observaciones opcionales',
    example: 'Vehículo principal del propietario',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  notas!: string | null;
}
