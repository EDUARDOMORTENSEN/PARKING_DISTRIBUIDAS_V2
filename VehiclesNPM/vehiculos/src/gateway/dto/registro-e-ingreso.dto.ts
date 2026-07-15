import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateVehiculoDto } from '../../vehiculos/dto/create-vehiculo.dto';

export class RegistroEIngresoDto {
  @ApiProperty({ type: () => CreateVehiculoDto, description: 'Datos completos del vehículo nuevo a registrar' })
  @ValidateNested()
  @Type(() => CreateVehiculoDto)
  vehiculo!: CreateVehiculoDto;

  @ApiProperty({ example: 'Z1', required: false, description: 'Código de zona específica solicitada (opcional)' })
  @IsOptional()
  @IsString()
  codigoZonaSolicitada?: string;

  @ApiProperty({ example: false, required: false, description: 'Modo degradado si ModuloZonas no responde' })
  @IsOptional()
  @IsBoolean()
  permitirSinValidarCupo?: boolean;
}
