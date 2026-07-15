import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SalidaDto {
  @ApiProperty({ example: 'ABC-1234', description: 'Placa del vehículo que sale' })
  @IsString()
  @IsNotEmpty({ message: 'La placa es obligatoria para registrar la salida' })
  placa!: string;
}
