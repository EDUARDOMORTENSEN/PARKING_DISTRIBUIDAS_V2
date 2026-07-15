import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class IngresoDto {
  @ApiProperty({ example: 'ABC-1234', description: 'Placa del vehículo que ingresa' })
  @IsString()
  @IsNotEmpty({ message: 'La placa es obligatoria para registrar el ingreso' })
  placa!: string;

  @ApiProperty({ example: 'Z1', required: false, description: 'Código de zona específica solicitada (opcional)' })
  @IsOptional()
  @IsString()
  codigoZonaSolicitada?: string;

  @ApiProperty({
    example: false, required: false,
    description: 'Si es true, permite el ingreso aunque ModuloZonas no responda (modo degradado). Por defecto false (modo estricto).',
  })
  @IsOptional()
  @IsBoolean()
  permitirSinValidarCupo?: boolean;
}
