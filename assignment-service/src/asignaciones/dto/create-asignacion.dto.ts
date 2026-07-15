import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para crear una nueva asignación de vehículo a propietario.
 * La clave compuesta se forma con userId + vehicleId.
 */
export class CreateAsignacionDto {
  @ApiProperty({
    description: 'UUID del propietario (debe existir en gestion-usuarios)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId!: string;

  @ApiProperty({
    description: 'UUID del vehículo (debe existir en vehiculos-service)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'vehicleId debe ser un UUID válido' })
  vehicleId!: string;

  @ApiProperty({
    description: 'Notas u observaciones opcionales sobre la asignación',
    example: 'Vehículo principal del propietario',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
