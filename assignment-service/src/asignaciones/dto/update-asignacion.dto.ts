import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para modificar una asignación existente.
 * Solo se permiten actualizar campos que no son parte de la clave compuesta.
 */
export class UpdateAsignacionDto {
  @ApiProperty({
    description: 'Estado de la asignación',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @ApiProperty({
    description: 'Notas u observaciones opcionales',
    example: 'Vehículo actualizado por cambio de propietario',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
